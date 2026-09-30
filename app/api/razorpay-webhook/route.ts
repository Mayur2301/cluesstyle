import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/lib/db";
import { verifyWebhookSignature } from "@/app/lib/razorpay";

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