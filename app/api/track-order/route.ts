// PATH: app/api/track-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrderByRef } from "@/app/lib/admin-orders";

// Public endpoint — no admin auth. Anyone can call this with an order ref,
// so it's gated by requiring the customer's own phone number to match too
// (same idea as "enter your order ID and the phone/email used to place
// it" on most tracking pages). It returns only the fields a customer
// needs to see their own shipment status — never the full order row
// (no address, no payment IDs, no admin_note, etc).
function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return digits; // last-10-digit form, for comparison only
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const orderRef = typeof body?.orderRef === "string" ? body.orderRef.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!orderRef || !phone) {
      return NextResponse.json({ error: "Enter your Order ID and phone number." }, { status: 400 });
    }

    const order = await getOrderByRef(orderRef);

    // Deliberately the same generic message whether the order ref doesn't
    // exist OR the phone doesn't match it — never confirm/deny that an
    // order ref is valid to someone who doesn't also know the phone number
    // on it.
    const notFoundResponse = () =>
      NextResponse.json(
        { error: "We couldn't find an order with that Order ID and phone number. Please double-check and try again." },
        { status: 404 }
      );

    if (!order) return notFoundResponse();

    const last10OnOrder = normalizePhone(order.customer_phone || "").slice(-10);
    const last10Entered = normalizePhone(phone).slice(-10);
    if (!last10OnOrder || last10OnOrder !== last10Entered) return notFoundResponse();

    return NextResponse.json({
      order: {
        order_ref: order.order_ref,
        order_status: order.order_status,
        payment_status: order.payment_status,
        product_name: order.product_name,
        quantity: order.quantity,
        selected_size: order.selected_size,
        selected_color: order.selected_color,
        shipping_provider: order.shipping_provider,
        awb_number: order.awb_number,
        tracking_link: order.tracking_link,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
    });
  } catch (err: any) {
    console.error("[track-order]", err);
    return NextResponse.json(
      { error: "Something went wrong looking up your order. Please try again in a moment." },
      { status: 500 }
    );
  }
}