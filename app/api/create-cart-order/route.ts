// PATH: app/api/create-cart-order/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getPool } from "@/app/lib/db";
import { findProductBySlug, resolveBaseUnitPrice } from "@/app/lib/product-catalog";
import {
  computeOrderTotal,
  computeEmbroideryCharge,
  computeDtfCharge,
  type DeliveryType,
  type PrintSide,
} from "@/app/lib/pricing";
import { createRazorpayOrder } from "@/app/lib/razorpay";
import { generateOrderRef, generateCartGroupRef } from "@/app/lib/order-ref";

// Multi-item cart checkout — ONE Razorpay payment for the whole cart, but
// one `orders` row PER cart item (so the existing admin dashboard, invoice
// generation, WhatsApp template and Shiprocket/Delhivery booking — all
// built around a single product per order — keep working unchanged for
// each item). The rows are linked by a shared `cart_group_ref`.
//
// Now mirrors create-razorpay-order's customization handling (logo
// uploads, embroidery/DTF pricing) per item, so a product added to cart
// WITH a logo design carries it through to the database exactly like the
// direct Buy Now flow — see app/lib/cart.ts's CartItemCustomization.
// GSTIN is now supported too (see gstNumber below), mirroring the same
// flow. Bulk colour+size breakdown is still NOT supported in cart
// checkout (out of scope for now).

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
const VALID_SIDES = ["front", "back", "left", "right"];
const MAX_NOTE_LENGTH = 1000;

function isAcceptableAssetUrl(url: string): boolean {
  return /^https:\/\//.test(url) || /^\/uploads\//.test(url);
}

function resolveProductUrl(pageUrl: unknown, fallbackSlug: string): string {
  const fallback = `${APP_URL}/products/${fallbackSlug}`;
  if (typeof pageUrl !== "string" || !pageUrl) return fallback;
  try {
    const parsed = new URL(pageUrl, APP_URL || undefined);
    const allowedOrigin = APP_URL ? new URL(APP_URL).origin : parsed.origin;
    if (parsed.origin !== allowedOrigin) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

type LogoLayerInput = { x: number; y: number; scale: number; rotation: number };
type LogoDesignInput = Record<string, { url: string; layers: LogoLayerInput[] }>;

interface CartItemCustomizationInput {
  note?: string;
  printType?: string;
  fabricType?: string;
  capType?: string;
  logoUrls?: Record<string, string>;
  logoDesign?: LogoDesignInput;
  printSides?: string[];
  badgeStyleSlug?: string;
  // Customer-level GSTIN, not part of the item's own customization form —
  // attached to every item's customization JSON so it's visible on
  // whichever order row of the cart an admin opens. See gstNumber above.
  gstNumber?: string;
}

interface CartItemInput {
  productSlug?: string;
  quantity?: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  // "plan" | "custom" — tote bags price Plain vs Custom Print differently.
  designMode?: string | null;
  sizeBreakdown?: Record<string, number>;
  deliveryType?: string;
  customization?: CartItemCustomizationInput;
}

interface ValidatedItem {
  product: NonNullable<ReturnType<typeof findProductBySlug>>;
  qty: number;
  delivery: DeliveryType;
  selectedSize: string | null;
  selectedColorForStorage: string | null;
  colorSku: string | null;
  sizeBreakdown: Record<string, number> | null;
  pricePerUnit: number;
  embroideryCharge: number;
  dtfCharge: number;
  cleanCustomization: CartItemCustomizationInput | null;
  itemSubtotal: number;
  itemGst: number;
  itemOriginalTotal: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      paymentMode,
      customer,
      address,
      pageUrl,
    }: {
      items?: CartItemInput[];
      paymentMode?: string;
      customer?: { name?: string; phone?: string; email?: string; gstNumber?: string };
      address?: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
      pageUrl?: string;
    } = body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }
    if (items.length > 30) {
      return NextResponse.json({ error: "Too many items in one checkout — please split into separate orders." }, { status: 400 });
    }

    const isCod = paymentMode === "cod";

    // Standard 15-character GSTIN format — same regex as
    // create-razorpay-order's single-product flow. Silently dropped (not
    // rejected) if malformed, since it's purely informational and
    // shouldn't block checkout. Customer-level (not per-item), so it's
    // attached to every item's own `customization` below — the admin order
    // detail page reads one item/order row at a time, and this way the
    // GSTIN shows up on whichever row of the cart order an admin opens.
    const gstNumber =
      customer?.gstNumber && /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z][A-Z\d]$/.test(customer.gstNumber.trim().toUpperCase())
        ? customer.gstNumber.trim().toUpperCase()
        : null;

    // ----------------------------------------------------
    // Customer / address validation — same rules as the single-product flow.
    // ----------------------------------------------------
    if (!customer?.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!customer?.phone || !/^[6-9]\d{9}$/.test(customer.phone)) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (
      !address?.line1?.trim() ||
      !address?.city?.trim() ||
      !address?.state?.trim() ||
      !address?.pincode ||
      !/^\d{6}$/.test(address.pincode)
    ) {
      return NextResponse.json({ error: "Please complete the delivery address" }, { status: 400 });
    }

    // ----------------------------------------------------
    // Validate + re-price every cart item server-side. Never trust the
    // client-sent price OR embroidery/DTF charge — recomputed here exactly
    // like create-razorpay-order does for the single-product flow.
    // ----------------------------------------------------
    const validated: ValidatedItem[] = [];

    for (const raw of items) {
      const product = findProductBySlug(raw.productSlug ?? "");
      if (!product) {
        return NextResponse.json({ error: `One of the items in your cart is no longer available.` }, { status: 400 });
      }

      const qty = Number(raw.quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        return NextResponse.json({ error: `Invalid quantity for ${product.name}.` }, { status: 400 });
      }

      const delivery: DeliveryType =
        raw.deliveryType === "sameday" ? "sameday" : raw.deliveryType === "pickup" ? "pickup" : "standard";
      if (delivery === "sameday" && !product.sameDayAvailable) {
        return NextResponse.json({ error: `Same-day delivery is not available for ${product.name}.` }, { status: 400 });
      }

      let colorSku: string | null = null;
      let selectedColorForStorage: string | null = raw.selectedColor ?? null;
      if (product.colors && product.colors.length > 0) {
        if (!raw.selectedColor) {
          return NextResponse.json({ error: `Please select a colour for ${product.name}.` }, { status: 400 });
        }
        const colorObj = product.colors.find((c) => c.label.toLowerCase() === String(raw.selectedColor).toLowerCase());
        if (!colorObj) {
          return NextResponse.json({ error: `Invalid colour selection for ${product.name}.` }, { status: 400 });
        }
        colorSku = colorObj.sku;
        selectedColorForStorage = colorObj.label;
      }

      const hasSizes = !!product.sizes && product.sizes.length > 0;
      let sizeBreakdown: Record<string, number> | null = null;
      if (hasSizes && raw.sizeBreakdown && Object.keys(raw.sizeBreakdown).length > 0) {
        let sum = 0;
        for (const [size, n] of Object.entries(raw.sizeBreakdown)) {
          if (!product.sizes!.includes(size)) {
            return NextResponse.json({ error: `Invalid size "${size}" for ${product.name}.` }, { status: 400 });
          }
          if (!Number.isInteger(n) || n < 0) {
            return NextResponse.json({ error: `Invalid quantity for ${product.name} size ${size}.` }, { status: 400 });
          }
          sum += n;
        }
        if (sum !== qty) {
          return NextResponse.json({ error: `Size breakdown does not add up to the quantity for ${product.name}.` }, { status: 400 });
        }
        sizeBreakdown = raw.sizeBreakdown;
      } else if (hasSizes && !raw.selectedSize) {
        return NextResponse.json({ error: `Please select a size for ${product.name}.` }, { status: 400 });
      }

      // ----------------------------------------------------
      // Customization validation — same rules as create-razorpay-order,
      // only applied when the product actually enables logo uploads.
      // ----------------------------------------------------
      let cleanCustomization: CartItemCustomizationInput | null = gstNumber ? { gstNumber } : null;
      const rawCustomization = raw.customization;

      if (rawCustomization && product.logoUploadEnabled) {
        cleanCustomization = cleanCustomization ?? {};

        if (typeof rawCustomization.note === "string" && rawCustomization.note.trim()) {
          cleanCustomization.note = rawCustomization.note.trim().slice(0, MAX_NOTE_LENGTH);
        }
        if (
          typeof rawCustomization.printType === "string" &&
          ["dtf", "embroidery"].includes(rawCustomization.printType)
        ) {
          cleanCustomization.printType = rawCustomization.printType;
        }
        if (typeof rawCustomization.fabricType === "string" && rawCustomization.fabricType.trim()) {
          cleanCustomization.fabricType = rawCustomization.fabricType.trim().slice(0, 100);
        }
        if (typeof rawCustomization.capType === "string" && rawCustomization.capType.trim()) {
          cleanCustomization.capType = rawCustomization.capType.trim().slice(0, 100);
        }
        if (rawCustomization.logoUrls && typeof rawCustomization.logoUrls === "object") {
          const urls: Record<string, string> = {};
          for (const [side, url] of Object.entries(rawCustomization.logoUrls)) {
            if (typeof url === "string" && isAcceptableAssetUrl(url)) urls[side] = url;
          }
          if (Object.keys(urls).length > 0) cleanCustomization.logoUrls = urls;
        }
        if (Array.isArray(rawCustomization.printSides)) {
          const sides = Array.from(
            new Set(rawCustomization.printSides.filter((s): s is string => typeof s === "string" && VALID_SIDES.includes(s)))
          );
          if (sides.length > 0) cleanCustomization.printSides = sides;
        }
        if (rawCustomization.logoDesign && typeof rawCustomization.logoDesign === "object") {
          const design: LogoDesignInput = {};
          for (const [side, entry] of Object.entries(rawCustomization.logoDesign)) {
            if (!VALID_SIDES.includes(side)) continue;
            if (!entry || typeof entry !== "object") continue;
            const { url, layers } = entry as { url?: unknown; layers?: unknown };
            if (typeof url !== "string" || !isAcceptableAssetUrl(url)) continue;
            if (!Array.isArray(layers) || layers.length === 0) continue;
            const cleanLayers: LogoLayerInput[] = [];
            for (const layer of layers) {
              if (!layer || typeof layer !== "object") continue;
              const { x, y, scale, rotation } = layer as Record<string, unknown>;
              if (
                typeof x === "number" && x >= 0 && x <= 100 &&
                typeof y === "number" && y >= 0 && y <= 100 &&
                typeof scale === "number" && scale > 0 && scale <= 5 &&
                typeof rotation === "number" && Number.isFinite(rotation)
              ) {
                cleanLayers.push({ x, y, scale, rotation });
              }
            }
            if (cleanLayers.length > 0) design[side] = { url, layers: cleanLayers };
          }
          if (Object.keys(design).length > 0) cleanCustomization.logoDesign = design;
        }
        if (typeof rawCustomization.badgeStyleSlug === "string" && rawCustomization.badgeStyleSlug.trim()) {
          const styleProduct = findProductBySlug(rawCustomization.badgeStyleSlug.trim());
          if (styleProduct && (styleProduct as any).category === "Badge") {
            cleanCustomization.badgeStyleSlug = styleProduct.slug;
          }
        }

        if (Object.keys(cleanCustomization).length === 0) cleanCustomization = null;
      }

      // Embroidery/DTF charge — recomputed server-side from the validated
      // sides list, exactly like create-razorpay-order. Prefers logoUrls
      // (real, upload-verified) over the printSides fallback.
      const activePrintSides: PrintSide[] = (
        cleanCustomization?.logoUrls
          ? Object.keys(cleanCustomization.logoUrls)
          : cleanCustomization?.printSides ?? []
      ) as PrintSide[];
      const embroideryCharge =
        cleanCustomization?.printType === "embroidery" ? computeEmbroideryCharge(qty, activePrintSides) : 0;
      const dtfCharge =
        cleanCustomization?.printType === "dtf" ? computeDtfCharge(qty, activePrintSides) : 0;

      const baseUnitPrice = resolveBaseUnitPrice(product, raw.selectedSize, raw.designMode);
      if (baseUnitPrice == null) {
        return NextResponse.json({ error: `Please re-select the size and fabric for ${product.name}.` }, { status: 400 });
      }

      const { pricePerUnit } = computeOrderTotal({
        displayPrice: baseUnitPrice,
        quantity: qty,
        deliveryType: "standard",
        tiers: product.qtyTiers,
      // Per-category price floor (badges) — undefined for every other
      // category, which keeps pricing.ts's default floor.
      minUnitPrice: product.minUnitPrice,
      });

      const itemSubtotal = pricePerUnit * qty + embroideryCharge + dtfCharge;
      const itemGst = Math.round(itemSubtotal * 0.05);
      const itemOriginalTotal = itemSubtotal + itemGst;

      validated.push({
        product,
        qty,
        delivery,
        selectedSize: hasSizes && !sizeBreakdown ? (raw.selectedSize ?? null) : null,
        selectedColorForStorage,
        colorSku,
        sizeBreakdown,
        pricePerUnit,
        embroideryCharge,
        dtfCharge,
        cleanCustomization,
        itemSubtotal,
        itemGst,
        itemOriginalTotal,
      });
    }

    // ----------------------------------------------------
    // Combined pricing — ONE payment for the whole cart. Same-day delivery
    // is never charged up front for any item (negotiated by phone after
    // the order is placed, matching every single-product page).
    // ----------------------------------------------------
    const cartOriginalTotal = validated.reduce((sum, v) => sum + v.itemOriginalTotal, 0);
    const PREPAID_DISCOUNT_PCT = 0.05;
    const COD_ADVANCE_PCT = 0.05;

    const cartGrandTotal = isCod ? cartOriginalTotal : Math.round(cartOriginalTotal * (1 - PREPAID_DISCOUNT_PCT));
    const cartAdvanceAmount = isCod ? Math.round(cartOriginalTotal * COD_ADVANCE_PCT) : cartGrandTotal;
    const cartCodDueAmount = isCod ? cartOriginalTotal - cartAdvanceAmount : 0;
    const amountPaise = cartAdvanceAmount * 100;

    if (amountPaise < 100) {
      return NextResponse.json({ error: "Cart total is too low to check out." }, { status: 400 });
    }

    const cartGroupRef = await generateCartGroupRef();

    const razorpayOrder = await createRazorpayOrder({
      amount: amountPaise,
      currency: "INR",
      receipt: cartGroupRef,
      notes: {
        cartGroupRef,
        itemCount: String(validated.length),
        paymentMode: isCod ? "cod" : "prepaid",
        codDueAmount: String(cartCodDueAmount),
        customerName: customer.name,
        phone: customer.phone,
        email: customer.email || "",
      },
    });

    // ----------------------------------------------------
    // Insert one `orders` row per item, all sharing cart_group_ref and the
    // one Razorpay order id. Each item's own grand_total/advance/cod_due is
    // its proportional share (for record-keeping / invoice display) — the
    // actual amount CHARGED is the combined amountPaise above, once.
    // `customization` carries logoDesign/logoUrls/printType exactly like
    // the single-product flow, so verify-cart-payment can generate the
    // design PDF the same way.
    // ----------------------------------------------------
    const pool = getPool();
    const itemResults: { orderRef: string; productName: string; quantity: number; grandTotal: number }[] = [];

    for (const v of validated) {
      const orderRef = await generateOrderRef();
      const productUrl = resolveProductUrl(pageUrl, v.product.slug);

      const itemGrandTotal = isCod ? v.itemOriginalTotal : Math.round(v.itemOriginalTotal * (1 - PREPAID_DISCOUNT_PCT));
      const itemAdvanceAmount = isCod ? Math.round(v.itemOriginalTotal * COD_ADVANCE_PCT) : itemGrandTotal;
      const itemCodDueAmount = isCod ? v.itemOriginalTotal - itemAdvanceAmount : 0;

      const storedCustomization: Record<string, any> | null = v.cleanCustomization
        ? { ...v.cleanCustomization }
        : v.sizeBreakdown
          ? {}
          : null;
      if (v.sizeBreakdown) {
        storedCustomization!.sizeBreakdown = v.sizeBreakdown;
      }

      await pool.query(
        `
        INSERT INTO orders (
          order_ref, cart_group_ref,
          razorpay_order_id,
          payment_status,

          product_id, product_name, product_slug, product_sku, color_sku, product_url,

          quantity, selected_size, selected_color, delivery_type,

          price_per_unit, same_day_charge, grand_total,

          payment_mode, advance_amount, cod_due_amount,

          customer_name, customer_phone, customer_email,

          address_line1, address_line2, address_city, address_state, address_pincode,

          customization,

          order_status
        )
        VALUES (
          ?, ?,
          ?,
          'pending',

          ?, ?, ?, ?, ?, ?,

          ?, ?, ?, ?,

          ?, 0, ?,

          ?, ?, ?,

          ?, ?, ?,

          ?, ?, ?, ?, ?,

          ?,

          'processing'
        )
        `,
        [
          orderRef, cartGroupRef,
          razorpayOrder.id,

          v.product.id, v.product.name, v.product.slug, v.product.sku, v.colorSku, productUrl,

          v.qty, v.selectedSize, v.selectedColorForStorage, v.delivery,

          v.pricePerUnit, itemGrandTotal,

          isCod ? "cod" : "prepaid", itemAdvanceAmount, itemCodDueAmount,

          customer.name.trim(), customer.phone, customer.email?.trim() || null,

          address.line1.trim(), address.line2?.trim() || null, address.city.trim(), address.state.trim(), address.pincode,

          storedCustomization ? JSON.stringify(storedCustomization) : null,
        ]
      );

      itemResults.push({ orderRef, productName: v.product.name, quantity: v.qty, grandTotal: itemGrandTotal });
    }

    return NextResponse.json({
      id: razorpayOrder.id,
      cartGroupRef,
      amount: amountPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

      cartOriginalTotal,
      cartGrandTotal,
      paymentMode: isCod ? "cod" : "prepaid",
      advanceAmount: cartAdvanceAmount,
      codDueAmount: cartCodDueAmount,
      prepaidDiscountAmount: isCod ? 0 : cartOriginalTotal - cartGrandTotal,

      items: itemResults,
    });
  } catch (err: any) {
    console.error("[create-cart-order]", err);
    return NextResponse.json({ error: err?.message || "Failed to create order" }, { status: 500 });
  }
}