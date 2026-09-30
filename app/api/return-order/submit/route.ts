// PATH: app/api/return-order/submit/route.ts
//
// Public endpoint — no admin auth (same phone-gate pattern as lookup).
// Re-checks eligibility server-side rather than trusting the client's
// earlier lookup response — the client could resubmit stale data, or the
// window could have lapsed between step 1 and step 4.
import { NextRequest, NextResponse } from "next/server";
import {
  checkReturnEligibility,
  createReturnRequest,
  isValidReturnReason,
  type ReturnItem,
} from "@/app/lib/return-orders";

// Duplicated from verify-razorpay-payment/route.ts on purpose — see that
// file's matching comment (each route keeps its own copy rather than
// sharing a module, so this one can't accidentally break unrelated flows).
function toE164(phone: string): string {
  let e164 = phone.replace(/\D/g, "");
  if (e164.startsWith("0")) e164 = e164.slice(1);
  if (e164.length === 10) e164 = `91${e164}`;
  return e164;
}

async function whatsappPost(payload: object): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return; // best-effort — no credentials configured

  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WhatsApp API error (${res.status}): ${text}`);
  }
}

const MAX_NOTE_LENGTH = 1000;

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
    const reason = body?.reason;
    const reasonNote = typeof body?.reasonNote === "string" ? body.reasonNote.trim().slice(0, MAX_NOTE_LENGTH) : null;
    const requestedItems: { order_ref?: string; quantity?: number }[] = Array.isArray(body?.items) ? body.items : [];

    if (!orderRef || !phone) {
      return NextResponse.json({ error: "Missing Order ID or phone number." }, { status: 400 });
    }
    if (!isValidReturnReason(reason)) {
      return NextResponse.json({ error: "Please select a valid return reason." }, { status: 400 });
    }
    if (requestedItems.length === 0) {
      return NextResponse.json({ error: "Select at least one item to return." }, { status: 400 });
    }

    const eligibility = await checkReturnEligibility(orderRef, phone);
    if (!eligibility.order) {
      return NextResponse.json({ error: "We couldn't find an order with that Order ID and phone number." }, { status: 404 });
    }
    if (!eligibility.eligible) {
      return NextResponse.json({ error: eligibility.reason || "This order isn't eligible for a return." }, { status: 400 });
    }

    // Only allow returning items that actually belong to this order's cart
    // group, and only up to the quantity that was actually ordered — never
    // trust the client's requested quantities as-is.
    const siblingByRef = new Map((eligibility.siblingItems || []).map((o) => [o.order_ref, o]));
    const items: ReturnItem[] = [];
    for (const reqItem of requestedItems) {
      const sibling = reqItem.order_ref ? siblingByRef.get(reqItem.order_ref) : undefined;
      if (!sibling) {
        return NextResponse.json(
          { error: `Item ${reqItem.order_ref ?? "(unknown)"} isn't part of this order.` },
          { status: 400 }
        );
      }
      const maxQty = Number(sibling.quantity ?? 1);
      const qty = Math.max(1, Math.min(Math.floor(Number(reqItem.quantity) || 1), maxQty));
      items.push({
        order_ref: sibling.order_ref,
        product_name: sibling.product_name,
        sku: sibling.product_sku,
        quantity: qty,
      });
    }

    const returnRef = await createReturnRequest({
      order_ref: eligibility.order.order_ref,
      cart_group_ref: eligibility.order.cart_group_ref,
      customer_name: eligibility.order.customer_name,
      customer_phone: eligibility.order.customer_phone,
      customer_email: eligibility.order.customer_email,
      items,
      reason,
      reason_note: reasonNote,
    });

    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
    if (adminPhone) {
      whatsappPost({
        to: toE164(adminPhone),
        type: "text",
        text: {
          body:
            `↩️ New return request\n` +
            `Return: ${returnRef}\n` +
            `Order: ${eligibility.order.order_ref}\n` +
            `Customer: ${eligibility.order.customer_name} (${eligibility.order.customer_phone})\n` +
            `Items: ${items.map((i) => `${i.product_name} x${i.quantity}`).join(", ")}\n` +
            `Reason: ${reason}` +
            (reasonNote ? `\nNote: ${reasonNote}` : ""),
        },
      }).catch((err) => console.error("[Return WhatsApp admin notify] Error:", err?.message ?? err));
    }

    return NextResponse.json({ success: true, returnRef });
  } catch (err: any) {
    console.error("[return-order/submit]", err);
    return NextResponse.json(
      { error: "Something went wrong submitting your return request. Please try again." },
      { status: 500 }
    );
  }
}
