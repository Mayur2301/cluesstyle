import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/lib/db";
import { createHmac } from "crypto";
import { verifyWebhookSignature } from "@/app/lib/razorpay";
import { needsFulfillment } from "@/app/lib/order-fulfillment-claim";
import { POST as verifySinglePayment } from "@/app/api/verify-razorpay-payment/route";
import { POST as verifyCartPayment } from "@/app/api/verify-cart-payment/route";

const FALLBACK_DELAY_MS = 20_000;

function scheduleFulfillmentFallback(razorpayOrderId: string, razorpayPaymentId: string): void {
  setTimeout(async () => {
    try {
      const { needed, isCart } = await needsFulfillment(getPool(), razorpayOrderId);
      if (!needed) return; // the browser already handled it

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        console.error("[webhook fallback] RAZORPAY_KEY_SECRET missing - cannot finish order", razorpayOrderId);
        return;
      }
      // The webhook itself is already authenticated, so we can mint the same
      // signature Razorpay's checkout would have handed the browser and reuse
      // the verify routes (and their invoice/email/courier pipeline) as-is.
      const signature = createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      const internalReq = new NextRequest("http://internal/razorpay-webhook-fallback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: signature,
        }),
      });

      console.log(`[webhook fallback] Browser never confirmed ${razorpayOrderId} - fulfilling from webhook.`);
      const res = await (isCart ? verifyCartPayment(internalReq) : verifySinglePayment(internalReq));
      if (!res.ok) console.error("[webhook fallback] verify route returned", res.status, "for", razorpayOrderId);
    } catch (err) {
      console.error("[webhook fallback] failed for", razorpayOrderId, err);
    }
  }, FALLBACK_DELAY_MS);
}

// Configure this URL in the Razorpay Dashboard → Settings → Webhooks, and set
// RAZORPAY_WEBHOOK_SECRET to the same secret you enter there. This endpoint is
// what keeps order_status correct even if the customer closes the tab right
// after paying, before the browser-side verify call completes.

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  let validSignature = false;
  try {
    validSignature = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error("webhook signature check error:", err);
  }

  if (!validSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const pool = getPool();

  try {
    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id && payment?.id) {
        await pool.query(
          `UPDATE orders
             SET payment_status = 'paid', order_status = 'confirmed',
                 razorpay_payment_id = ?, updated_at = NOW()
           WHERE razorpay_order_id = ? AND payment_status != 'paid'`,
          [payment.id, payment.order_id]
        );

        // Safety net: if the customer closed the tab before the browser's
        // verify call, nobody would send the invoice / email / WhatsApp or
        // book the courier. Give the browser a head start, then - only if the
        // order is still unclaimed - run the same pipeline ourselves. Fire and
        // forget so Razorpay gets its 200 straight away; claimFulfillment()
        // inside the verify routes guarantees it never runs twice.
        scheduleFulfillmentFallback(payment.order_id, payment.id);
      }
    } else if (event.event === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await pool.query(
          `UPDATE orders SET payment_status = 'failed', updated_at = NOW()
           WHERE razorpay_order_id = ? AND payment_status != 'paid'`,
          [payment.order_id]
        );
      }
    }
  } catch (err) {
    console.error("webhook processing error:", err);
    // Still acknowledge receipt so Razorpay doesn't retry indefinitely for a parse error.
  }

  return NextResponse.json({ received: true });
}