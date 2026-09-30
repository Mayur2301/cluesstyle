// PATH: app/api/return-order/lookup/route.ts
//
// Public endpoint — no admin auth. Step 1 of the return flow ("Select
// Order"). Same ownership gate as /api/track-order (order ref + the
// phone number on file must both match), plus return-eligibility rules
// from app/lib/return-orders.ts (delivered, within the return window, no
// existing open return request).
import { NextRequest, NextResponse } from "next/server";
import { checkReturnEligibility } from "@/app/lib/return-orders";

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

    const result = await checkReturnEligibility(orderRef, phone);

    // Order not found / phone didn't match — same generic message as
    // track-order, so this endpoint can't be used to confirm whether an
    // order ref exists.
    if (!result.order) {
      return NextResponse.json(
        { error: result.reason || "We couldn't find an order with that Order ID and phone number. Please double-check and try again." },
        { status: 404 }
      );
    }

    if (!result.eligible) {
      return NextResponse.json({ eligible: false, error: result.reason }, { status: 200 });
    }

    return NextResponse.json({
      eligible: true,
      order: {
        order_ref: result.order.order_ref,
        customer_name: result.order.customer_name,
        customer_phone: result.order.customer_phone,
        customer_email: result.order.customer_email,
        cart_group_ref: result.order.cart_group_ref,
      },
      items: (result.siblingItems || []).map((o) => ({
        order_ref: o.order_ref,
        product_name: o.product_name,
        product_sku: o.product_sku,
        selected_size: o.selected_size,
        selected_color: o.selected_color,
        quantity: o.quantity,
        grand_total: o.grand_total,
      })),
    });
  } catch (err: any) {
    console.error("[return-order/lookup]", err);
    return NextResponse.json(
      { error: "Something went wrong looking up your order. Please try again in a moment." },
      { status: 500 }
    );
  }
}
