// PATH: app/api/admin/orders/[orderRef]/send-shipping-update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrderByRef, SHIPPING_PROVIDERS } from "@/app/lib/admin-orders";
import { requireAdminSession } from "@/app/lib/admin-auth";

// Duplicated from verify-razorpay-payment/route.ts on purpose — that file
// is the live payment-confirmation flow and isn't touched here, so this
// route can't accidentally break it. Keep both copies in sync if the
// WhatsApp sending logic ever changes.
function toE164(phone: string): string {
  let e164 = phone.replace(/\D/g, "");
  if (e164.startsWith("0")) e164 = e164.slice(1);
  if (e164.length === 10) e164 = `91${e164}`;
  return e164;
}

async function whatsappPost(payload: object): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    throw new Error("WhatsApp credentials (WHATSAPP_TOKEN / WHATSAPP_PHONE_ID) are not configured.");
  }

  const fullPayload = { messaging_product: "whatsapp", ...payload };

  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fullPayload),
  });

  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`WhatsApp API error (${res.status}): ${responseText}`);
  }
}

function courierLabel(providerValue: string | null): string {
  if (!providerValue) return "our courier partner";
  const match = SHIPPING_PROVIDERS.find((p) => p.value === providerValue);
  return match ? match.label : providerValue;
}

// POST /api/admin/orders/[orderRef]/send-shipping-update — sends the
// "shipping_update" WhatsApp template to the customer using whatever
// shipping_provider / awb_number / tracking_link are currently SAVED on
// the order. Call this only after ShippingDetailsControl has saved those
// fields — this route re-reads them from the DB rather than trusting
// anything from the request body, so it always sends what's actually on
// record.
//
// Requires a WhatsApp template named "shipping_update" to be approved in
// Meta Business Manager first — see the body text this route sends below
// for exactly what to submit for approval.
// SECURITY FIX: previously had NO auth check — anyone who knew an order
// ref could trigger a WhatsApp send to that customer's real phone number.
// See the matching note on app/api/admin/orders/[orderRef]/route.ts.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { orderRef } = await params;

  try {
    const order = await getOrderByRef(orderRef);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (!order.customer_phone) {
      return NextResponse.json({ error: "This order has no customer phone number on file." }, { status: 400 });
    }

    if (!order.shipping_provider || !order.awb_number) {
      return NextResponse.json(
        { error: "Save the courier and AWB number first, then send." },
        { status: 400 }
      );
    }

    const e164 = toE164(order.customer_phone);
    const courier = courierLabel(order.shipping_provider);
    const awb = order.awb_number;
    // Template requires all {{n}} slots to be non-empty — WhatsApp rejects
    // a template send if any variable resolves to an empty string, so fall
    // back to a plain-English placeholder when no tracking link was saved.
    const trackingLink = order.tracking_link || "Will be shared once available";

    await whatsappPost({
      to: e164,
      type: "template",
      template: {
        name: "shipping_template",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: order.customer_name },
              { type: "text", text: order.order_ref },
              { type: "text", text: courier },
              { type: "text", text: awb },
              { type: "text", text: trackingLink },
            ],
          },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-shipping-update]", err);
    return NextResponse.json(
      { error: err?.message || "Could not send the WhatsApp update. Check server logs for details." },
      { status: 500 }
    );
  }
}
