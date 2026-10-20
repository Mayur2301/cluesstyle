// PATH: app/api/verify-cart-payment/route.ts
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
import { claimFulfillment } from "@/app/lib/order-fulfillment-claim";
import { generateDesignPdf, type LogoDesign, type Side } from "@/app/lib/design-pdf";
import { computeEmbroideryCharge, computeDtfCharge, type PrintSide } from "@/app/lib/pricing";

// Verifies ONE Razorpay payment that covers a whole cart, then runs the
// existing per-product fulfillment pipeline (invoice, email, WhatsApp,
// design PDF, courier booking) ONCE PER ITEM ROW that shares this
// razorpay_order_id. A cart of 3 items means the customer gets 3 separate
// invoice PNGs and 3 separate WhatsApp "invoice_template" messages, one
// per product — a deliberate trade-off to reuse the existing per-order
// pipeline rather than building a new combined-invoice template.
//
// Duplicated from verify-razorpay-payment/route.ts on purpose — that file
// is the live single-product payment flow and isn't touched here, so this
// route can't accidentally break it.

const BLANK_MEDIA_SIDE_ORDER: Side[] = ["front", "back", "right", "left"];

function toE164(phone: string): string {
  let e164 = phone.replace(/\D/g, "");
  if (e164.startsWith("0")) e164 = e164.slice(1);
  if (e164.length === 10) e164 = `91${e164}`;
  return e164;
}

function parseCustomization(raw: unknown): Record<string, any> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Record<string, any>;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return null;
}

function parseSelectedSize(raw: string | null | undefined): { sizeKey: string | null; gsmValue: number | null } {
  if (!raw) return { sizeKey: null, gsmValue: null };
  const parts = raw.split("—").map((p) => p.trim());
  const sizeKey = parts[0] || null;
  const gsmMatch = parts[1]?.match(/(\d+)\s*GSM/i);
  const gsmValue = gsmMatch ? Number(gsmMatch[1]) : null;
  return { sizeKey, gsmValue };
}

async function whatsappPost(payload: object): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    console.error("[WhatsApp] Aborting — missing credentials.");
    return;
  }
  const fullPayload = { messaging_product: "whatsapp", ...payload };
  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(fullPayload),
  });
  const responseText = await res.text();
  if (!res.ok) throw new Error(`WhatsApp API error (${res.status}): ${responseText}`);
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
    to: e164,
    type: "template",
    template: {
      name: "invoice_template",
      language: { code: "en" },
      components: [
        { type: "header", parameters: [{ type: "image", image: { link: invoiceUrl } }] },
        { type: "body", parameters: [{ type: "text", text: customerName }, { type: "text", text: orderSummary }] },
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

    // Marks EVERY item row from this cart checkout paid in one statement —
    // razorpay_order_id is shared across all of them (see create-cart-order).
    const [updateResult]: any = await pool.execute(
      `UPDATE orders
       SET payment_status = 'paid',
           razorpay_payment_id = ?, razorpay_signature = ?, updated_at = NOW()
       WHERE razorpay_order_id = ? AND payment_status != 'paid'`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    const [rows]: any = await pool.execute(
      `SELECT * FROM orders WHERE razorpay_order_id = ?`,
      [razorpay_order_id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Run the post-payment work if this request OR the Razorpay webhook marked
    // the order paid first - whichever gets here first claims it, exactly once.
    if (await claimFulfillment(pool, razorpay_order_id, updateResult.affectedRows > 0)) {
      // Run the existing per-product fulfillment pipeline for each item.
      // Best-effort per item — one item's invoice/WhatsApp/shipping failure
      // never blocks the others or the payment confirmation itself, same
      // as the single-product route's behaviour.
      for (const order of rows) {
        const customization = parseCustomization(order.customization);

        // Product photo + embroidery/DTF charge aren't their own DB columns
        // (see verify-razorpay-payment's matching block for the full
        // explanation) — derived here the same way, recomputed from
        // customization rather than trusted from anywhere else.
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
        };

        let invoiceUrl: string | null = null;
        try {
          const result = await generateAndUploadInvoice(invoiceImageData);
          invoiceUrl = result.invoiceUrl;
          await pool.execute(
            `UPDATE orders SET invoice_url = ?, updated_at = NOW() WHERE order_ref = ?`,
            [invoiceUrl, order.order_ref]
          );
        } catch (err: any) {
          console.error("[Cart Invoice] Error:", order.order_ref, err?.message ?? err);
        }

        // Design PDF — identical logic to verify-razorpay-payment's, only
        // runs when this item actually carries a logoDesign (i.e. it was
        // added to cart via the logo-design flow, not a plain product).
        let designPdfUrl: string | null = null;
        if (customization?.logoDesign) {
          try {
            const badgeStyleProduct =
              typeof customization?.badgeStyleSlug === "string"
                ? findProductBySlug(customization.badgeStyleSlug)
                : null;
            const product = badgeStyleProduct ?? findProductBySlug(order.product_slug);

            const candidateColorLabels = [order.selected_color].filter(
              (label): label is string => !!label
            );
            let colorObj = candidateColorLabels
              .map((label) => product?.colors?.find((c) => c.label.toLowerCase() === label.toLowerCase()))
              .find((c) => c && (c as any).blankMedia?.length);
            if (!colorObj) {
              colorObj = candidateColorLabels
                .map((label) => product?.colors?.find((c) => c.label.toLowerCase() === label.toLowerCase()))
                .find(Boolean);
            }
            if (!colorObj && badgeStyleProduct) {
              colorObj = badgeStyleProduct.colors?.[0];
            }

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
                `UPDATE orders SET design_pdf_url = ?, design_pdf_error = NULL, updated_at = NOW() WHERE order_ref = ?`,
                [designPdfUrl, order.order_ref]
              );
              console.log("[Cart Design PDF] Generated:", designPdfUrl, "for", order.order_ref);
            } else {
              const reason = `No blank garment images found for colour "${
                candidateColorLabels[0] ?? order.selected_color ?? "(unknown)"
              }" (product "${order.product_slug}", size "${order.selected_size}"). Check that this colour exists in the catalog with blankMedia photos.`;
              console.warn(`[Cart Design PDF] ${reason} — skipped for ${order.order_ref}.`);
              await pool.execute(
                `UPDATE orders SET design_pdf_error = ?, updated_at = NOW() WHERE order_ref = ?`,
                [reason, order.order_ref]
              );
            }
          } catch (err: any) {
            const reason = String(err?.message ?? err).slice(0, 500);
            console.error("[Cart Design PDF] Error:", order.order_ref, reason);
            try {
              await pool.execute(
                `UPDATE orders SET design_pdf_error = ?, updated_at = NOW() WHERE order_ref = ?`,
                [reason, order.order_ref]
              );
            } catch (dbErr: any) {
              console.error("[Cart Design PDF] Failed to record error:", order.order_ref, dbErr?.message ?? dbErr);
            }
          }

          const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
          if (adminPhone) {
            whatsappPost({
              to: toE164(adminPhone),
              type: "text",
              text: {
                body:
                  `🎨 Customized cart order received\n` +
                  `Order: ${order.order_ref}\n` +
                  `Product: ${order.product_name}\n` +
                  `Customer: ${order.customer_name} (${order.customer_phone})\n` +
                  (designPdfUrl
                    ? `Design PDF: ${process.env.NEXT_PUBLIC_APP_URL ?? ""}${designPdfUrl}`
                    : `Design PDF: generation failed — check server logs for ${order.order_ref}`),
              },
            }).catch((err) => console.error("[Cart WhatsApp admin notify] Error:", err?.message ?? err));
          }
        }

        const invoiceEmailData: InvoiceData = {
          orderRef: order.order_ref, customerName: order.customer_name,
          customerEmail: order.customer_email, customerPhone: order.customer_phone,
          productName: order.product_name, productSlug: order.product_slug,
          // Same absolute image URL already resolved above for the PDF
          // invoice — previously never passed here, so the email fell
          // through to a guessed "/og-image.jpg" path nothing generates.
          productImageUrl: invoiceProductImage,
          productUrl: order.product_url, quantity: order.quantity,
          selectedSize: order.selected_size, selectedColor: order.selected_color,
          deliveryType: order.delivery_type, pricePerUnit: order.price_per_unit,
          sameDayCharge: order.same_day_charge, grandTotal: order.grand_total,
          addressLine1: order.address_line1, addressLine2: order.address_line2 ?? "",
          addressCity: order.address_city, addressState: order.address_state,
          addressPincode: order.address_pincode, razorpayPaymentId: razorpay_payment_id,
          createdAt: new Date().toISOString(),
          // Same COD/embroidery/DTF fields already computed above for the
          // PDF invoice — keeps the email and the PDF agreeing on what was
          // actually paid vs. still due on delivery.
          paymentMode: order.payment_mode === "cod" ? "cod" : "prepaid",
          advanceAmountPaid: Number(order.advance_amount ?? order.grand_total),
          codDueAmount: Number(order.cod_due_amount ?? 0),
          paymentMethod:
            order.payment_mode === "cod" ? "Razorpay (Advance) + Cash on Delivery" : "Razorpay",
          embroideryCharge: invoiceEmbroideryCharge || undefined,
          dtfCharge: invoiceDtfCharge || undefined,
        };
        if (order.customer_email) {
          sendInvoiceEmail(invoiceEmailData).catch((err) => console.error("[Cart Email] Error:", order.order_ref, err));
        }

        if (order.customer_phone && invoiceUrl) {
          sendWhatsAppInvoiceTemplate({
            phone: order.customer_phone, customerName: order.customer_name,
            orderRef: order.order_ref, productName: order.product_name,
            quantity: Number(order.quantity), grandTotal: Number(order.grand_total),
            invoiceUrl,
          })
            .then(() => console.log("[Cart WhatsApp] Sent for:", order.order_ref))
            .catch((err) => console.error("[Cart WhatsApp] Error:", order.order_ref, err?.message ?? err));
        } else {
          console.warn("[Cart WhatsApp] Skipped —", order.order_ref, !order.customer_phone ? "no phone" : "no invoiceUrl");
        }

        if (order.delivery_type === "pickup") {
          console.log("[Cart Fulfillment] Self-pickup — no courier booking needed:", order.order_ref);
        } else {
          const [shiprocketResult, delhiveryResult] = await Promise.allSettled([
            createShiprocketOrder(order),
            createDelhiveryOrder(order),
          ]);
          shiprocketResult.status === "fulfilled"
            ? console.log("[Cart Shiprocket] Created:", order.order_ref, shiprocketResult.value)
            : console.error("[Cart Shiprocket] Failed:", order.order_ref, shiprocketResult.reason);
          delhiveryResult.status === "fulfilled"
            ? console.log("[Cart Delhivery] Created:", order.order_ref, delhiveryResult.value)
            : console.error("[Cart Delhivery] Failed:", order.order_ref, delhiveryResult.reason);
        }
      }
    } else {
      console.log(`[verify-cart-payment] razorpay_order_id ${razorpay_order_id} already paid — skipping.`);
    }

    return NextResponse.json({
      success: true,
      cartGroupRef: rows[0].cart_group_ref,
      orders: rows.map((o: any) => {
        // Computed fresh here (not reused from the fulfillment loop above,
        // which only runs the first time a payment is verified) so the
        // success screen gets the same product photo/SKU whether this is
        // the first verify call or an idempotent replay.
        const summaryCustomization = parseCustomization(o.customization);
        const summaryBadgeProduct = summaryCustomization?.badgeStyleSlug
          ? findProductBySlug(summaryCustomization.badgeStyleSlug)
          : null;
        const summaryProduct = summaryBadgeProduct ?? findProductBySlug(o.product_slug);
        return {
          orderRef: o.order_ref,
          productName: o.product_name,
          productSku: o.product_sku ?? undefined,
          productImage: (summaryProduct as { images?: string[] } | null)?.images?.[0] ?? undefined,
          selectedSize: o.selected_size ?? null,
          selectedColor: o.selected_color ?? null,
          quantity: Number(o.quantity),
          pricePerUnit: Number(o.price_per_unit),
          grandTotal: Number(o.grand_total),
        };
      }),
    });
  } catch (err: any) {
    console.error("[verify-cart-payment] Unhandled error:", err);
    return NextResponse.json({ error: "Could not verify payment" }, { status: 500 });
  }
}