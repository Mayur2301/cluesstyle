import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/lib/db";
import { verifyPaymentSignature } from "@/app/lib/razorpay";
import { sendInvoiceEmail, InvoiceData } from "@/app/lib/mailer";
import { createShiprocketOrder } from "@/app/lib/shiprocket";
import { createDelhiveryOrder } from "@/app/lib/delhivery";
import {
  generateAndUploadInvoice,
  toAbsoluteProductImageUrl,
  InvoiceData as InvoiceImageData,
} from "@/app/lib/invoice";
import { findProductBySlug } from "@/app/lib/product-catalog";
import { generateDesignPdf, type LogoDesign, type Side } from "@/app/lib/design-pdf";
import { computeEmbroideryCharge, computeDtfCharge, type PrintSide } from "@/app/lib/pricing";

// Maps this project's blank-garment media order (front, back, right, left —
// see ProductDetailClient's `blankMedia[0..3]`) onto the named sides used
// throughout the customization/design-PDF code.
const BLANK_MEDIA_SIDE_ORDER: Side[] = ["front", "back", "right", "left"];

function toE164(phone: string): string {
  let e164 = phone.replace(/\D/g, "");
  if (e164.startsWith("0")) e164 = e164.slice(1);
  if (e164.length === 10) e164 = `91${e164}`;
  return e164;
}

// Safely parse the (optional) customization JSON column added for
// products with size breakdowns / logo customization / print-fabric
// options. Older orders (or simple products that never sent it) will
// just have NULL here, so this always returns null in that case rather
// than throwing.
function parseCustomization(raw: unknown): Record<string, any> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Record<string, any>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

// Parses this project's combined "selected_size" strings, e.g.
// "12x14 — 150 GSM" (classic products with sizeDetails + gsmVariants,
// see ProductDetailClient's OrderModal size prop) into its parts. Also
// tolerates a plain "12x14" (no GSM suffix) by leaving gsmValue null —
// products/orders that never had a GSM tier at all.
function parseSelectedSize(raw: string | null | undefined): { sizeKey: string | null; gsmValue: number | null } {
  if (!raw) return { sizeKey: null, gsmValue: null };
  const parts = raw.split("—").map((p) => p.trim());
  const sizeKey = parts[0] || null;
  const gsmMatch = parts[1]?.match(/(\d+)\s*GSM/i);
  const gsmValue = gsmMatch ? Number(gsmMatch[1]) : null;
  return { sizeKey, gsmValue };
}

async function whatsappPost(payload: object): Promise<void> {
  const token   = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  console.log("[WhatsApp] Token present :", !!token);
  console.log("[WhatsApp] Phone ID present:", !!phoneId);

  if (!token || !phoneId) {
    console.error("[WhatsApp] Aborting — missing credentials.");
    return;
  }

  const fullPayload = { messaging_product: "whatsapp", ...payload };

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fullPayload),
    }
  );

  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`WhatsApp API error (${res.status}): ${responseText}`);
  }
  console.log("[WhatsApp] Success");
}

async function sendWhatsAppInvoiceTemplate({
  phone, customerName, orderRef, productName, quantity, grandTotal, invoiceUrl,
}: {
  phone: string; customerName: string; orderRef: string;
  productName: string; quantity: number; grandTotal: number; invoiceUrl: string;
}): Promise<void> {
  const e164 = toE164(phone);

  const totalFormatted = Number(grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const orderSummary = `Order: ${orderRef} | Product: ${productName} (x${quantity}) | Total: Rs.${totalFormatted}`;

  await whatsappPost({
    to:   e164,
    type: "template",
    template: {
      name:     "invoice_template",
      language: { code: "en" },
      components: [
        {
          type: "header",
          parameters: [{ type: "image", image: { link: invoiceUrl } }],
        },
        {
          type: "body",
          parameters: [
            { type: "text", text: customerName },
            { type: "text", text: orderSummary },
          ],
        },
      ],
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const pool = getPool();

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      await pool.execute(
        `UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE razorpay_order_id = ?`,
        [razorpay_order_id]
      );
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const [updateResult]: any = await pool.execute(
      `UPDATE orders
       SET payment_status = 'paid',
           razorpay_payment_id = ?, razorpay_signature = ?, updated_at = NOW()
       WHERE razorpay_order_id = ? AND payment_status != 'paid'`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    const [rows]: any = await pool.execute(
      `SELECT * FROM orders WHERE razorpay_order_id = ? LIMIT 1`,
      [razorpay_order_id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = rows[0];
    // Parsed, ready-to-use form of the optional customization JSON column.
    // NULL/undefined for every order that doesn't use it — existing
    // products are unaffected.
    const customization = parseCustomization(order.customization);

    if (updateResult.affectedRows > 0) {

      // 4a. Invoice
      //
      // Product photo + embroidery/DTF charge aren't their own DB columns
      // (the orders table only has price_per_unit/grand_total — see
      // create-razorpay-order's INSERT), so both are derived here exactly
      // the way create-razorpay-order derived them in the first place:
      // the photo from the catalog via product_slug, the charge recomputed
      // from customization.printType + the logo sides, using the SAME
      // computeEmbroideryCharge/computeDtfCharge functions — not trusted
      // from anywhere else, so it can never drift from what was actually
      // charged.
      const invoiceBadgeStyleProduct = customization?.badgeStyleSlug
        ? findProductBySlug(customization.badgeStyleSlug)
        : null;
      const invoiceProduct = invoiceBadgeStyleProduct ?? findProductBySlug(order.product_slug);
      // Catalog images are site-relative paths ("/office-bag/.../front.webp")
      // — resolve to an absolute URL or the Python script's fetch fails silently.
      const invoiceProductImage = toAbsoluteProductImageUrl(
        (invoiceProduct as { images?: string[] } | null)?.images?.[0]
      );

      const invoiceActiveSides: PrintSide[] = (
        customization?.logoUrls
          ? Object.keys(customization.logoUrls)
          : customization?.printSides ?? []
      ) as PrintSide[];
      const invoiceEmbroideryCharge =
        customization?.printType === "embroidery"
          ? computeEmbroideryCharge(Number(order.quantity), invoiceActiveSides)
          : 0;
      const invoiceDtfCharge =
        customization?.printType === "dtf"
          ? computeDtfCharge(Number(order.quantity), invoiceActiveSides)
          : 0;

      const invoiceImageData: InvoiceImageData = {
        orderRef: order.order_ref, razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id, productName: order.product_name,
        productImage: invoiceProductImage, productSku: order.product_sku ?? undefined,
        selectedSize: order.selected_size ?? null, selectedColor: order.selected_color ?? null,
        deliveryType: order.delivery_type,
        quantity: Number(order.quantity), pricePerUnit: Number(order.price_per_unit),
        embroideryCharge: invoiceEmbroideryCharge || undefined, dtfCharge: invoiceDtfCharge || undefined,
        sameDayCharge: Number(order.same_day_charge), grandTotal: Number(order.grand_total),
        // COD only ever collects a small advance via Razorpay right now
        // (order.advance_amount) — the rest (order.cod_due_amount) is cash
        // on delivery, never actually paid online. Without these the
        // invoice showed the full grand_total as "Total Paid" even for COD
        // orders, which overstated what the customer had actually paid.
        paymentMode: order.payment_mode === "cod" ? "cod" : "prepaid",
        advanceAmountPaid: Number(order.advance_amount ?? order.grand_total),
        codDueAmount: Number(order.cod_due_amount ?? 0),
        paymentMethod:
          order.payment_mode === "cod" ? "Razorpay (Advance) + Cash on Delivery" : "Razorpay",
        customer: { name: order.customer_name, phone: order.customer_phone, email: order.customer_email ?? null },
        address: { line1: order.address_line1, line2: order.address_line2 ?? null,
          city: order.address_city, state: order.address_state, pincode: order.address_pincode },
        // NOTE: sizeBreakdown / fabricType are still available in
        // `customization` above but not threaded into the invoice — add
        // them here too if you want them printed.
      };

      let invoiceUrl: string | null = null;
      try {
        const result = await generateAndUploadInvoice(invoiceImageData);
        invoiceUrl = result.invoiceUrl;
        await pool.execute(
          `UPDATE orders SET invoice_url = ?, updated_at = NOW() WHERE razorpay_order_id = ?`,
          [invoiceUrl, razorpay_order_id]
        );
      } catch (err: any) {
        console.error("[Invoice] Error:", err?.message ?? err);
      }

      // 4a-bis. Design PDF (only for orders with an actual logo design)
      let designPdfUrl: string | null = null;
      if (customization?.logoDesign) {
        try {
          // Badge style-picker pages (e.g. "Customized Badges") keep
          // `order.product_slug` pinned to the generic umbrella product —
          // pricing is keyed to it — but that umbrella product has no
          // colours/blankMedia of its own (each concrete badge shape does).
          // `customization.badgeStyleSlug`, when present and validated
          // server-side at order-creation time, points at the actual shape
          // the customer picked (e.g. "square-pin-badge"), which DOES carry
          // the right colour + blankMedia photos. Fall back to the umbrella
          // product for every other product, unchanged from before.
          const badgeStyleProduct =
            typeof customization?.badgeStyleSlug === "string"
              ? findProductBySlug(customization.badgeStyleSlug)
              : null;
          const product = badgeStyleProduct ?? findProductBySlug(order.product_slug);

          // Resolve which colour's blank-garment photos to use. For a plain
          // single-colour order, `order.selected_color` is authoritative.
          // For a bulk multi-colour order (customization.colorBreakdown),
          // `order.selected_color` only ever holds the FIRST colour the
          // customer picked (see ProductDetailClient's `filledBulkRows[0]`)
          // — if that particular label fails to match (typo, later-removed
          // row, casing) the PDF used to silently skip even though other
          // breakdown colours would have matched fine. Try every colour the
          // order actually contains, in order, before giving up.
          const candidateColorLabels = [
            order.selected_color,
            ...(Array.isArray(customization?.colorBreakdown)
              ? (customization.colorBreakdown as { color: string }[]).map((cb) => cb.color)
              : []),
          ].filter((label): label is string => !!label);
          let colorObj = candidateColorLabels
            .map((label) => product?.colors?.find((c) => c.label.toLowerCase() === label.toLowerCase()))
            .find((c) => c && (c as any).blankMedia?.length);
          if (!colorObj) {
            // Still nothing usable — fall back to the first match by name
            // even without confirmed blankMedia, so the rest of the logic
            // below (which already handles missing blankMedia gracefully)
            // runs the same as before.
            colorObj = candidateColorLabels
              .map((label) => product?.colors?.find((c) => c.label.toLowerCase() === label.toLowerCase()))
              .find(Boolean);
          }
          if (!colorObj && badgeStyleProduct) {
            // Badge styles resolved via badgeStyleSlug are effectively
            // single-colour (one "Grey"/"Sky Blue"/etc. entry each) — if no
            // label matched above (e.g. an order placed before this field
            // existed, so order.selected_color is still null), just use
            // that style's own colour rather than skipping the PDF entirely.
            colorObj = badgeStyleProduct.colors?.[0];
          }

          // Prefer the size+GSM-specific blank photos when the product has
          // them (sizeDetails[size].gsmVariants[gsm].blankMedia — Natural/
          // Black Canvas Tote Bag and any future product using that
          // structure), falling back to the color's own flat `blankMedia`
          // (Sample Kit / Customized Tote Bag, which never use sizeDetails
          // at all). Matches resolveBlankMedia()'s priority order in
          // ProductDetailClient.tsx exactly, so the PDF always uses the
          // same photo the customer actually saw in the live preview.
          const { sizeKey, gsmValue } = parseSelectedSize(order.selected_size);
          const sizeGsmBlankMedia =
            sizeKey && gsmValue != null
              ? ((product as any)?.sizeDetails?.[sizeKey]?.gsmVariants?.[gsmValue]?.blankMedia as
                  | { src: string }[]
                  | undefined)
              : undefined;
          const blankMediaList =
            sizeGsmBlankMedia && sizeGsmBlankMedia.length > 0
              ? sizeGsmBlankMedia
              : ((colorObj as any)?.blankMedia as { src: string }[] | undefined);

          const blankMediaBySide: Partial<Record<Side, string>> = {};
          BLANK_MEDIA_SIDE_ORDER.forEach((side, i) => {
            const src = blankMediaList?.[i]?.src ?? blankMediaList?.[0]?.src;
            if (src) blankMediaBySide[side] = src;
          });

          if (Object.keys(blankMediaBySide).length > 0) {
            const { pdfUrl } = await generateDesignPdf({
              orderRef: order.order_ref,
              blankMediaBySide,
              logoDesign: customization.logoDesign as LogoDesign,
            });
            designPdfUrl = pdfUrl;
            await pool.execute(
              `UPDATE orders SET design_pdf_url = ?, design_pdf_error = NULL, updated_at = NOW() WHERE razorpay_order_id = ?`,
              [designPdfUrl, razorpay_order_id]
            );
            console.log("[Design PDF] Generated:", designPdfUrl, "for", order.order_ref);
          } else {
            // Surfaced in the admin dashboard (Section "🎨 Custom Design")
            // instead of only a server log, so this doesn't require log
            // access to diagnose — e.g. a bulk multi-colour order whose
            // colour labels never matched anything in the catalog, or a
            // product colour missing its blankMedia photos entirely.
            const reason = `No blank garment images found for colour "${
              candidateColorLabels[0] ?? order.selected_color ?? "(unknown)"
            }" (product "${order.product_slug}", size "${order.selected_size}"). Check that this colour exists in the catalog with blankMedia photos.`;
            console.warn(`[Design PDF] ${reason} — skipped for ${order.order_ref}.`);
            await pool.execute(
              `UPDATE orders SET design_pdf_error = ?, updated_at = NOW() WHERE razorpay_order_id = ?`,
              [reason, razorpay_order_id]
            );
          }
        } catch (err: any) {
          // Never let a design-PDF failure block payment confirmation or
          // the rest of the fulfillment flow — but do record it so the
          // admin dashboard can show why generation didn't happen.
          const reason = String(err?.message ?? err).slice(0, 500);
          console.error("[Design PDF] Error:", reason);
          try {
            await pool.execute(
              `UPDATE orders SET design_pdf_error = ?, updated_at = NOW() WHERE razorpay_order_id = ?`,
              [reason, razorpay_order_id]
            );
          } catch (dbErr: any) {
            console.error("[Design PDF] Failed to record error:", dbErr?.message ?? dbErr);
          }
        }

        // Let the admin know a customized order came in. This is
        // best-effort via WhatsApp (outbound messages outside an existing
        // 24-hour session window require an approved template, same as
        // customer invoice_template — a plain text message may silently
        // fail to deliver depending on window state). The GUARANTEED way
        // admin sees this is the dashboard itself: any order with
        // design_pdf_url set shows a "Custom Design" badge / section.
        const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
        if (adminPhone) {
          whatsappPost({
            to: toE164(adminPhone),
            type: "text",
            text: {
              body:
                `🎨 Customized order received\n` +
                `Order: ${order.order_ref}\n` +
                `Product: ${order.product_name}\n` +
                `Customer: ${order.customer_name} (${order.customer_phone})\n` +
                (designPdfUrl
                  ? `Design PDF: ${process.env.NEXT_PUBLIC_APP_URL ?? ""}${designPdfUrl}`
                  : `Design PDF: generation failed — check server logs for ${order.order_ref}`),
            },
          }).catch((err) => console.error("[WhatsApp admin notify] Error:", err?.message ?? err));
        }
      }

      // 4b. Email
      const invoiceEmailData: InvoiceData = {
        orderRef: order.order_ref, customerName: order.customer_name,
        customerEmail: order.customer_email, customerPhone: order.customer_phone,
        productName: order.product_name, productSlug: order.product_slug,
        // Reuses the same absolute image URL already resolved above for the
        // PDF invoice — this was never passed here before, so the email
        // always fell through to a guessed "/og-image.jpg" path that no
        // route on the site actually generates (always 404s), which is why
        // the product photo never rendered in the order-confirmation email.
        productImageUrl: invoiceProductImage,
        productUrl: order.product_url, quantity: order.quantity,
        selectedSize: order.selected_size, selectedColor: order.selected_color,
        deliveryType: order.delivery_type, pricePerUnit: order.price_per_unit,
        sameDayCharge: order.same_day_charge, grandTotal: order.grand_total,
        addressLine1: order.address_line1, addressLine2: order.address_line2 ?? "",
        addressCity: order.address_city, addressState: order.address_state,
        addressPincode: order.address_pincode, razorpayPaymentId: razorpay_payment_id,
        createdAt: new Date().toISOString(),
        // Same COD/embroidery/DTF fields already computed above for the PDF
        // invoice — without these the email would show the full grand_total
        // as "Total Paid" on a COD order even though only the advance was
        // actually charged (the exact bug just fixed in the PDF invoice).
        paymentMode: order.payment_mode === "cod" ? "cod" : "prepaid",
        advanceAmountPaid: Number(order.advance_amount ?? order.grand_total),
        codDueAmount: Number(order.cod_due_amount ?? 0),
        paymentMethod:
          order.payment_mode === "cod" ? "Razorpay (Advance) + Cash on Delivery" : "Razorpay",
        embroideryCharge: invoiceEmbroideryCharge || undefined,
        dtfCharge: invoiceDtfCharge || undefined,
      };
      if (order.customer_email) {
        sendInvoiceEmail(invoiceEmailData).catch((err) => console.error("[Email] Error:", err));
      }

      // 4c. WhatsApp
      if (order.customer_phone && invoiceUrl) {
        sendWhatsAppInvoiceTemplate({
          phone: order.customer_phone, customerName: order.customer_name,
          orderRef: order.order_ref, productName: order.product_name,
          quantity: Number(order.quantity), grandTotal: Number(order.grand_total),
          invoiceUrl,
        })
          .then(() => console.log("[WhatsApp] Sent for:", order.order_ref))
          .catch((err) => console.error("[WhatsApp] Error:", err?.message ?? err));
      } else {
        console.warn("[WhatsApp] Skipped —", !order.customer_phone ? "no phone" : "no invoiceUrl");
      }

      // 4d. Shipping
      // Borzo (the dedicated same-day courier) has been detached — same-day
      // delivery charges/timing are now negotiated separately by phone (an
      // executive calls the customer after payment), and the actual
      // shipment now goes through the same couriers as a standard order.
      // Self-pickup orders skip courier booking entirely since the
      // customer collects in person.
      if (order.delivery_type === "pickup") {
        console.log("[Fulfillment] Self-pickup order — no courier booking needed:", order.order_ref);
      } else {
        const [shiprocketResult, delhiveryResult] = await Promise.allSettled([
          createShiprocketOrder(order),
          createDelhiveryOrder(order),
        ]);
        shiprocketResult.status === "fulfilled"
          ? console.log("[Shiprocket] Created:", shiprocketResult.value)
          : console.error("[Shiprocket] Failed:", shiprocketResult.reason);
        delhiveryResult.status === "fulfilled"
          ? console.log("[Delhivery] Created:", delhiveryResult.value)
          : console.error("[Delhivery] Failed:", delhiveryResult.reason);
      }
    } else {
      console.log(`[verify-payment] ${order.order_ref} already paid — skipping.`);
    }

    return NextResponse.json({
      success: true,
      order: {
        orderRef: order.order_ref, productName: order.product_name,
        quantity: order.quantity, grandTotal: order.grand_total,
      },
    });
  } catch (err: any) {
    console.error("[verify-payment] Unhandled error:", err);
    return NextResponse.json({ error: "Could not verify payment" }, { status: 500 });
  }
}