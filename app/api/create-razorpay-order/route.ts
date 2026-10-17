import { NextRequest, NextResponse } from "next/server";

import { getPool } from "@/app/lib/db";
import { findProductBySlug, resolveBaseUnitPrice } from "@/app/lib/product-catalog";
import { computeOrderTotal, computeEmbroideryCharge, computeDtfCharge, type DeliveryType, type PrintSide } from "@/app/lib/pricing";
import { createRazorpayOrder } from "@/app/lib/razorpay";
import { generateOrderRef } from "@/app/lib/order-ref";

// ----------------------------------------------------
// Customization — OPTIONAL, product-specific extras.
// Every field is optional so products that don't use
// customization (plain size/color items) send nothing
// here and behave exactly as before.
// ----------------------------------------------------
type LogoLayerInput = { x: number; y: number; scale: number; rotation: number };
type LogoDesignInput = Record<string, { url: string; layers: LogoLayerInput[] }>;

type OrderCustomization = {
  // Optional second contact number, entered by the shopper at checkout.
  // Purely informational — never validated as strictly as the primary
  // phone, and there's no dedicated `orders` column for it, so it lives
  // here in the customization JSON instead.
  altPhone?: string;
  // Optional GSTIN, for business customers who need it on their invoice.
  // Same reasoning as altPhone: no dedicated column, lives in customization.
  gstNumber?: string;
  sizeBreakdown?: Record<string, number>; // multi-size single order, e.g. { S: 10, M: 20 }
  // Multi-COLOUR bulk order: several colours in ONE order/payment, each with
  // its own size split — e.g. Red { S:10, M:5 } + Blue { M:8, L:7 }. When
  // present (>=1 entry) this takes priority over the plain `sizeBreakdown`
  // above and over the top-level `selectedColor`.
  colorBreakdown?: { color: string; sizeBreakdown: Record<string, number> }[];
  note?: string;                          // free-text customization note
  printType?: string;                     // e.g. "dtf" | "embroidery"
  fabricType?: string;                    // e.g. "premium-pique" (apparel)
  capType?: string;                       // e.g. "Trucker Cap" (caps)
  logoUrls?: Record<string, string>;      // side -> hosted URL (legacy/simple form)
  logoDesign?: LogoDesignInput;           // side -> { url, layers: [{x,y,scale,rotation}] } — exact placement for the design PDF
  // Which sides (front/back/left/right) have a logo, for products without
  // server-side logo uploads yet (e.g. round-neck-tshirt, oversized-products)
  // — only used when `logoUrls` isn't present. Ignored whenever `logoUrls`
  // IS present, since that's the more trustworthy, upload-verified signal.
  //
  // IMPORTANT: this must be the actual side NAMES, not just a count — DTF
  // and embroidery now price each side differently (e.g. front costs more
  // than a sleeve), so a plain count is no longer enough information to
  // compute the correct charge.
  printSides?: string[];
  // Concrete badge style slug (e.g. "square-pin-badge") picked on a
  // style-picker badge page like "customized-badges" — used ONLY to resolve
  // which colour's blankMedia photos the design PDF should use after
  // payment. Never used for pricing (that stays keyed to `productSlug`).
  badgeStyleSlug?: string;
};

const VALID_SIDES = ["front", "back", "left", "right"];

const MAX_NOTE_LENGTH = 1000;

// Accepts either an absolute https URL (e.g. S3/Cloudinary) or a local
// path under /uploads/ (this project's current storage — see
// /api/upload-logo). Rejects blob:/data: URLs, which are client-local and
// meaningless once they reach the server.
function isAcceptableAssetUrl(url: string): boolean {
  return /^https:\/\//.test(url) || /^\/uploads\//.test(url);
}

// The app's own origin — used to validate that a client-supplied `pageUrl`
// actually points back at this app (never trust it blindly; a request body
// is fully attacker-controlled) before using it as the "exact page" link
// stored on the order / sent to Razorpay.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

// Resolves the EXACT page the customer was ordering from (full path +
// query string, e.g. /products/bags/tote-bag/customized-tote-bag?size=medium&gsm=330)
// when the client supplies one, falling back to a generic guessed path
// (/products/<slug>, no query string) for any page that hasn't been updated
// to send `pageUrl` yet. Rejects anything not on this app's own origin.
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      productSlug,
      quantity,
      selectedSize,
      selectedColor,
      designMode,
      deliveryType,
      paymentMode,
      customer,
      address,
      customization,
      pageUrl,
    }: {
      productSlug?: string;
      quantity?: number;
      selectedSize?: string | null;
      selectedColor?: string | null;
      // "plan" (plain) | "custom" (custom print) — tote bags price differently.
      designMode?: string | null;
      deliveryType?: string;
      // "cod" charges only a 5% confirmation amount via Razorpay now, with
      // the rest collected in cash on delivery. Anything else (including
      // omitted) is treated as a normal full-payment ("prepaid") order.
      paymentMode?: string;
      customer?: {
        name?: string;
        phone?: string;
        // Optional second contact number — stored inside `customization`
        // (there's no dedicated column for it), purely informational, not
        // validated as strictly as the primary phone.
        altPhone?: string;
        // Optional GSTIN — same reasoning as altPhone above.
        gstNumber?: string;
        email?: string;
      };
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
      };
      customization?: OrderCustomization;
      pageUrl?: string;
    } = body ?? {};

    const isCod = paymentMode === "cod";

    // ----------------------------------------------------
    // Product lookup (server-side only)
    // ----------------------------------------------------

    console.log("[create-razorpay-order] Incoming productSlug:", JSON.stringify(productSlug));

    const product = findProductBySlug(productSlug ?? "");

    if (!product) {
      console.error(
        "[create-razorpay-order] Invalid product — no catalog match for slug:",
        JSON.stringify(productSlug),
        "| typeof productSlug:", typeof productSlug
      );
      return NextResponse.json(
        { error: "Invalid product" },
        { status: 400 }
      );
    }

    console.log(
      "[create-razorpay-order] Matched product:",
      product.slug, "| sku:", product.sku, "| name:", product.name
    );

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // Delivery validation
    // ----------------------------------------------------

    const delivery: DeliveryType =
      deliveryType === "sameday"
        ? "sameday"
        : deliveryType === "pickup"
          ? "pickup"
          : "standard";

    if (
      delivery === "sameday" &&
      !product.sameDayAvailable
    ) {
      return NextResponse.json(
        {
          error:
            "Same-day delivery is not available for this product",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // Colour / size resolution (server-side only)
    // ----------------------------------------------------
    // Two shapes are accepted:
    //   1. customization.colorBreakdown — one or more colours in ONE order,
    //      each with its own size split (the "bulk colour + size" flow).
    //      Every colour must be a real product colour, every size a real
    //      product size, and everything must add up to `qty` exactly.
    //      Takes priority over everything below when present.
    //   2. selectedColor + (selectedSize OR customization.sizeBreakdown) —
    //      the original single-colour flow, unchanged.

    const hasSizes = !!product.sizes && product.sizes.length > 0;

    let colorSku: string | null = null;
    let selectedColorForStorage: string | null = selectedColor ?? null;
    let resolvedColorBreakdown: { color: string; colorSku: string; sizeBreakdown: Record<string, number> }[] | null = null;
    let sizeBreakdown: Record<string, number> | null = null;

    const rawColorBreakdown = customization?.colorBreakdown;

    if (Array.isArray(rawColorBreakdown) && rawColorBreakdown.length > 0) {
      if (!product.colors || product.colors.length === 0) {
        return NextResponse.json({ error: "This product does not support multiple colours" }, { status: 400 });
      }
      if (!hasSizes) {
        return NextResponse.json({ error: "This product does not support a colour/size breakdown" }, { status: 400 });
      }

      const seen = new Set<string>();
      const resolved: { color: string; colorSku: string; sizeBreakdown: Record<string, number> }[] = [];
      let grandSum = 0;

      for (const entry of rawColorBreakdown) {
        const colorLabel = typeof entry?.color === "string" ? entry.color.trim() : "";
        if (!colorLabel) {
          return NextResponse.json({ error: "Invalid colour in order" }, { status: 400 });
        }
        const key = colorLabel.toLowerCase();
        if (seen.has(key)) {
          return NextResponse.json({ error: `Colour "${colorLabel}" was sent more than once` }, { status: 400 });
        }
        seen.add(key);

        const colorObj = product.colors.find((c) => c.label.toLowerCase() === key);
        if (!colorObj) {
          return NextResponse.json({ error: `Invalid colour selection: ${colorLabel}` }, { status: 400 });
        }

        const rawSizes = entry?.sizeBreakdown;
        if (!rawSizes || typeof rawSizes !== "object") {
          return NextResponse.json({ error: `Missing size breakdown for colour "${colorObj.label}"` }, { status: 400 });
        }

        const cleanSizes: Record<string, number> = {};
        let colorSum = 0;
        for (const [size, n] of Object.entries(rawSizes)) {
          if (!product.sizes!.includes(size)) {
            return NextResponse.json({ error: `Invalid size "${size}" for colour "${colorObj.label}"` }, { status: 400 });
          }
          if (!Number.isInteger(n) || (n as number) < 0) {
            return NextResponse.json({ error: `Invalid quantity for ${colorObj.label} / ${size}` }, { status: 400 });
          }
          if ((n as number) > 0) cleanSizes[size] = n as number;
          colorSum += n as number;
        }
        if (colorSum <= 0) {
          return NextResponse.json({ error: `Colour "${colorObj.label}" has no pieces allocated` }, { status: 400 });
        }

        grandSum += colorSum;
        resolved.push({ color: colorObj.label, colorSku: colorObj.sku, sizeBreakdown: cleanSizes });
      }

      if (grandSum !== qty) {
        return NextResponse.json({ error: "Colour/size breakdown does not add up to the total quantity" }, { status: 400 });
      }

      resolvedColorBreakdown = resolved;
      // A single colour still goes through this path (simpler for the
      // client to always send the same shape) but is stored exactly like a
      // normal single-colour order: one label, one SKU.
      selectedColorForStorage = resolved.map((r) => r.color).join(", ");
      colorSku = resolved.length === 1 ? resolved[0].colorSku : null;
    } else {
      // Original single-colour path — unchanged behaviour.
      if (product.colors && product.colors.length > 0) {
        if (!selectedColor) {
          return NextResponse.json(
            { error: "Please select a colour" },
            { status: 400 }
          );
        }
        const colorObj = product.colors.find(
          (c) => c.label.toLowerCase() === String(selectedColor).toLowerCase()
        );
        if (!colorObj) {
          return NextResponse.json(
            { error: "Invalid colour selection" },
            { status: 400 }
          );
        }
        colorSku = colorObj.sku;
        selectedColorForStorage = colorObj.label;
      }

      const rawBreakdown = customization?.sizeBreakdown;
      if (hasSizes && rawBreakdown && Object.keys(rawBreakdown).length > 0) {
        // Multi-size flow — validate against the product's own size list & qty.
        let sum = 0;
        for (const [size, n] of Object.entries(rawBreakdown)) {
          if (!product.sizes!.includes(size)) {
            return NextResponse.json(
              { error: `Invalid size in breakdown: ${size}` },
              { status: 400 }
            );
          }
          if (!Number.isInteger(n) || n < 0) {
            return NextResponse.json(
              { error: `Invalid quantity for size ${size}` },
              { status: 400 }
            );
          }
          sum += n;
        }
        if (sum !== qty) {
          return NextResponse.json(
            { error: "Size breakdown does not add up to the total quantity" },
            { status: 400 }
          );
        }
        sizeBreakdown = rawBreakdown;
      } else if (hasSizes && !selectedSize) {
        return NextResponse.json(
          { error: "Please select a size" },
          { status: 400 }
        );
      }
    }

    const productSku = product.sku;

    // ----------------------------------------------------
    // Customer validation
    // ----------------------------------------------------

    if (!customer?.name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (
      !customer?.phone ||
      !/^[6-9]\d{9}$/.test(customer.phone)
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid 10-digit mobile number",
        },
        { status: 400 }
      );
    }

    if (
      customer.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        customer.email
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid email address",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // Address validation
    // ----------------------------------------------------

    if (
      !address?.line1?.trim() ||
      !address?.city?.trim() ||
      !address?.state?.trim() ||
      !address?.pincode ||
      !/^\d{6}$/.test(address.pincode)
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete the delivery address",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // Customization validation (all optional — only applied
    // when the product actually supports the feature)
    // ----------------------------------------------------

    const altPhone = customer.altPhone && /^[0-9]{10}$/.test(customer.altPhone.trim()) ? customer.altPhone.trim() : null;
    // Standard 15-character GSTIN format — silently dropped (not rejected)
    // if malformed, since it's purely informational and shouldn't block checkout.
    const gstNumber =
      customer.gstNumber && /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z][A-Z\d]$/.test(customer.gstNumber.trim().toUpperCase())
        ? customer.gstNumber.trim().toUpperCase()
        : null;

    let cleanCustomization: OrderCustomization | null = altPhone || gstNumber ? {} : null;
    if (altPhone) cleanCustomization!.altPhone = altPhone;
    if (gstNumber) cleanCustomization!.gstNumber = gstNumber;

    if (customization) {
      cleanCustomization = cleanCustomization ?? {};

      if (resolvedColorBreakdown) {
        cleanCustomization.colorBreakdown = resolvedColorBreakdown.map(({ color, sizeBreakdown }) => ({ color, sizeBreakdown }));
      } else if (sizeBreakdown) {
        cleanCustomization.sizeBreakdown = sizeBreakdown;
      }

      if (typeof customization.note === "string" && customization.note.trim()) {
        cleanCustomization.note = customization.note.trim().slice(0, MAX_NOTE_LENGTH);
      }

      // printType / fabricType only accepted for products that actually
      // enable logo/customization — ignored (not rejected) otherwise, so an
      // older or unrelated product page can never send an unexpected 400.
      if (product.logoUploadEnabled) {
        if (
          typeof customization.printType === "string" &&
          ["dtf", "embroidery"].includes(customization.printType)
        ) {
          cleanCustomization.printType = customization.printType;
        }
        if (
          typeof customization.fabricType === "string" &&
          customization.fabricType.trim()
        ) {
          cleanCustomization.fabricType = customization.fabricType.trim().slice(0, 100);
        }
        if (
          typeof customization.capType === "string" &&
          customization.capType.trim()
        ) {
          cleanCustomization.capType = customization.capType.trim().slice(0, 100);
        }
        if (customization.logoUrls && typeof customization.logoUrls === "object") {
          const urls: Record<string, string> = {};
          for (const [side, url] of Object.entries(customization.logoUrls)) {
            if (typeof url === "string" && isAcceptableAssetUrl(url)) {
              urls[side] = url;
            }
          }
          if (Object.keys(urls).length > 0) cleanCustomization.logoUrls = urls;
        }

        // Fallback for products without server-side logo uploads (see type
        // definition above). Only real, recognized side names survive —
        // anything else in the array is silently dropped, and duplicates
        // are collapsed since a side can only be "on" once.
        if (Array.isArray(customization.printSides)) {
          const sides = Array.from(
            new Set(customization.printSides.filter((s): s is string => typeof s === "string" && VALID_SIDES.includes(s)))
          );
          if (sides.length > 0) cleanCustomization.printSides = sides;
        }

        // logoDesign carries EXACT placement (position/scale/rotation) per
        // side, captured from the live preview canvas — this is what the
        // design PDF gets generated from after payment. Validated strictly:
        // bad/out-of-range numbers here would produce a garbled PDF later.
        if (customization.logoDesign && typeof customization.logoDesign === "object") {
          const design: LogoDesignInput = {};
          for (const [side, entry] of Object.entries(customization.logoDesign)) {
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
            if (cleanLayers.length > 0) {
              design[side] = { url, layers: cleanLayers };
            }
          }
          if (Object.keys(design).length > 0) cleanCustomization.logoDesign = design;
        }

        // Badge-type style pages (e.g. "Customized Badges" with
        // isStylePicker) let the shopper pick a concrete physical badge
        // (Round Pin / Square Pin / Round Magnet / ...) without navigating
        // off the generic umbrella product page. `productSlug` stays the
        // umbrella product ("customized-badges") on purpose — that's what
        // pricing/qtyTiers are keyed to — but the design-PDF step needs to
        // know which concrete style's colour/blankMedia photos to use.
        // Validated against the catalog so this can never be used to smuggle
        // an arbitrary slug through — only an actual Badge-category product
        // already in the catalog is accepted, and only for badge products.
        if (typeof customization.badgeStyleSlug === "string" && customization.badgeStyleSlug.trim()) {
          const styleProduct = findProductBySlug(customization.badgeStyleSlug.trim());
          if (styleProduct && (styleProduct as any).category === "Badge") {
            cleanCustomization.badgeStyleSlug = styleProduct.slug;
          }
        }
      }

      if (Object.keys(cleanCustomization).length === 0) cleanCustomization = null;
    }

    // ----------------------------------------------------
    // Server-side pricing
    // ----------------------------------------------------

    const baseUnitPrice = resolveBaseUnitPrice(product, selectedSize, designMode);
    if (baseUnitPrice == null) {
      return NextResponse.json({ error: `Please select a valid size and fabric for ${product.name}.` }, { status: 400 });
    }

    const { pricePerUnit } = computeOrderTotal({
      displayPrice: baseUnitPrice,
      quantity: qty,
      deliveryType: "standard", // get base price only
      // Category-specific bulk tiers if this product defines its own (e.g.
      // t-shirts' TSHIRT_QTY_TIERS attached via product-catalog.ts) —
      // MUST be the exact same table the product page used to compute the
      // price it showed the customer, or falls back to pricing.ts's global
      // default for categories that haven't defined their own yet.
      tiers: product.qtyTiers,
      // Per-category price floor (badges) — undefined for every other
      // category, which keeps pricing.ts's default floor.
      minUnitPrice: product.minUnitPrice,
    });

    // Must match the client's calculation exactly (see ProductDetailClient.tsx /
    // pricing.ts's computeEmbroideryCharge / computeDtfCharge): each side has
    // its own price, summed and multiplied by quantity — plus, for
    // embroidery only, a flat ₹700 one-time design charge unless the order
    // is 10+ pieces. The actual side NAMES (not just a count) are required
    // now, since front/back/left/right are no longer priced identically.
    //
    // Prefers cleanCustomization.logoUrls (real, upload-verified hosted
    // URLs — used by products like solid-polo-neck) and only falls back to
    // the validated printSides array (used by products like
    // round-neck-tshirt / oversized-products that don't upload logos
    // server-side yet) when no logoUrls were sent at all. Either way,
    // always from cleanCustomization (already validated above), never the
    // raw request body.
    const activePrintSides: PrintSide[] = (
      cleanCustomization?.logoUrls
        ? Object.keys(cleanCustomization.logoUrls)
        : cleanCustomization?.printSides ?? []
    ) as PrintSide[];
    const numEmbroideryPositions = activePrintSides.length; // kept for notes/response display only
    const embroideryCharge =
      cleanCustomization?.printType === "embroidery"
        ? computeEmbroideryCharge(qty, activePrintSides)
        : 0;
    const dtfCharge =
      cleanCustomization?.printType === "dtf"
        ? computeDtfCharge(qty, activePrintSides)
        : 0;

    const subtotal = pricePerUnit * qty + embroideryCharge + dtfCharge;

    // Same-day delivery no longer gets a live Borzo quote — the charge is
    // now negotiated separately by phone after the order is placed (an
    // executive calls the customer to confirm it), so nothing is charged
    // for delivery at checkout time for EITHER same-day or self-pickup.
    const sameDayCharge = 0;

    const gstAmount = Math.round((subtotal + sameDayCharge) * 0.05);
    const originalGrandTotal = subtotal + sameDayCharge + gstAmount;

    // ----------------------------------------------------
    // Payment mode pricing
    //   - "prepaid" (Pay Now): an instant 5% discount is applied to the
    //     WHOLE order (including GST) as an incentive for paying online in
    //     full. `grandTotal` below already reflects this discounted total
    //     — it's both what's charged now and the order's real value, so
    //     nothing downstream needs to know about the discount separately.
    //   - "cod": no prepay discount applies, since the customer isn't
    //     paying the full amount online — only a 5% confirmation charge is
    //     collected now, calculated on the FULL undiscounted total.
    // ----------------------------------------------------
    const PREPAID_DISCOUNT_PCT = 0.05;
    const COD_ADVANCE_PCT = 0.05;

    const grandTotal = isCod ? originalGrandTotal : Math.round(originalGrandTotal * (1 - PREPAID_DISCOUNT_PCT));
    const advanceAmount = isCod ? Math.round(originalGrandTotal * COD_ADVANCE_PCT) : grandTotal;
    const codDueAmount = isCod ? originalGrandTotal - advanceAmount : 0;
    const amountPaise = advanceAmount * 100;

    // ----------------------------------------------------
    // Order Reference
    // ----------------------------------------------------

    const orderRef = await generateOrderRef();

    // Uses the exact page the customer ordered from (full category path +
    // ?size=/?color=/?gsm= etc.) when the client sends `pageUrl`, otherwise
    // falls back to the old generic guess. See resolveProductUrl() above.
    const productUrl = resolveProductUrl(pageUrl, product.slug);

    // ----------------------------------------------------
    // Create Razorpay Order
    // ----------------------------------------------------

    const razorpayOrder =
      await createRazorpayOrder({
        amount: amountPaise,
        currency: "INR",
        receipt: orderRef,
        notes: {
          product: product.name,
          productSlug: product.slug,
          quantity: String(qty),
          deliveryType: delivery,
          embroideryCharge: String(embroideryCharge),
          dtfCharge: String(dtfCharge),
          paymentMode: isCod ? "cod" : "prepaid",
          codDueAmount: String(codDueAmount),

          customerName: customer.name,
          phone: customer.phone,
          email: customer.email || "",
        },
      });

    // ----------------------------------------------------
    // Save pending order
    // ----------------------------------------------------

    const pool = getPool();

    await pool.query(
      `
      INSERT INTO orders (
        order_ref,
        razorpay_order_id,
        payment_status,

        product_id,
        product_name,
        product_slug,
        product_sku,
        color_sku,
        product_url,

        quantity,
        selected_size,
        selected_color,
        delivery_type,

        price_per_unit,
        same_day_charge,
        grand_total,

        payment_mode,
        advance_amount,
        cod_due_amount,

        customer_name,
        customer_phone,
        customer_email,

        address_line1,
        address_line2,
        address_city,
        address_state,
        address_pincode,

        customization,

        order_status
      )
      VALUES (
        ?, ?, 'pending',

          ?, ?, ?, ?, ?, ?,

        ?, ?, ?, ?,

        ?, ?, ?,

        ?, ?, ?,

        ?, ?, ?,

        ?, ?, ?, ?, ?,

        ?,

        'processing'
      )

      ON DUPLICATE KEY UPDATE
        razorpay_order_id = VALUES(razorpay_order_id),
        payment_status = 'pending',
        payment_mode = VALUES(payment_mode),
        advance_amount = VALUES(advance_amount),
        cod_due_amount = VALUES(cod_due_amount),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        orderRef,
        razorpayOrder.id,

        product.id,
        product.name,
        product.slug,
        productSku,
        colorSku,
        productUrl,

        qty,
        selectedSize ?? null,
        selectedColorForStorage,
        delivery,

        pricePerUnit,
        sameDayCharge,
        grandTotal,

        isCod ? "cod" : "prepaid",
        advanceAmount,
        codDueAmount,

        customer.name.trim(),
        customer.phone,
        customer.email?.trim() || null,

        address.line1.trim(),
        address.line2?.trim() || null,
        address.city.trim(),
        address.state.trim(),
        address.pincode,

        cleanCustomization ? JSON.stringify(cleanCustomization) : null,
      ]
    );

    // ----------------------------------------------------
    // Response
    // ----------------------------------------------------

    return NextResponse.json({
      id: razorpayOrder.id,
      orderRef,

      amount: amountPaise,
      currency: "INR",

      keyId:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

      pricePerUnit,
      embroideryCharge,
      dtfCharge,
      sameDayCharge,
      gstAmount,
      grandTotal,

      // For COD orders `amount` above already IS the advance (5%) — these
      // let the client show "Pay ₹X now, ₹Y on delivery" without having to
      // recompute the split itself.
      paymentMode: isCod ? "cod" : "prepaid",
      advanceAmount,
      codDueAmount,
      // Full undiscounted total, and the 5% Pay Now discount amount — lets
      // the client show a "was ₹X, now ₹Y (5% off)" style comparison
      // without recomputing the discount itself. 0 for COD (no discount).
      originalGrandTotal,
      prepaidDiscountAmount: isCod ? 0 : originalGrandTotal - grandTotal,
    });
  } catch (err: any) {
    console.error(
      "[create-razorpay-order]",
      err
    );

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to create order",
      },
      {
        status: 500,
      }
    );
  }
}