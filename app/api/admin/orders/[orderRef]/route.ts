// PATH: app/api/admin/orders/[orderRef]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getOrderByRef, isValidOrderStatus, isValidShippingProvider } from "@/app/lib/admin-orders";
import { requireAdminSession } from "@/app/lib/admin-auth";

const MAX_NOTE_LENGTH = 2000;
const MAX_TRACKING_LINK_LENGTH = 512;
const MAX_AWB_LENGTH = 64;

// GET /api/admin/orders/[orderRef] — fetch one order (used by the detail page's
// client-side refresh after a status update; the initial page load reads
// straight from the DB server-side instead).
//
// SECURITY FIX: this route previously had NO auth check at all — anyone
// who knew (or guessed) an order ref could read the full order row
// (address, payment IDs, admin notes) or, on PATCH below, change its
// status/shipping details. app/middleware.ts does NOT cover /api/admin/**
// (see the note on app/lib/admin-auth.ts's requireAdminSession), so every
// /api/admin/** route has to check the session itself.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { orderRef } = await params;
  const order = await getOrderByRef(orderRef);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}

// PATCH /api/admin/orders/[orderRef] — update order_status, admin_note,
// and/or the manually-entered shipping details (shipping_provider,
// tracking_link, awb_number). Accepts any subset of these fields
// independently so each control on the page can save without stepping on
// the others' values.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { orderRef } = await params;

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const { order_status, admin_note, shipping_provider, tracking_link, awb_number } = body ?? {};

    const updates: string[] = [];
    const values: any[] = [];

    if (order_status !== undefined) {
      if (!isValidOrderStatus(order_status)) {
        return NextResponse.json(
          { error: "order_status must be one of: processing, shipped, delivered, cancelled." },
          { status: 400 }
        );
      }
      updates.push("order_status = ?");
      values.push(order_status);
    }

    if (admin_note !== undefined) {
      if (typeof admin_note !== "string") {
        return NextResponse.json({ error: "admin_note must be a string." }, { status: 400 });
      }
      if (admin_note.length > MAX_NOTE_LENGTH) {
        return NextResponse.json(
          { error: `admin_note must be under ${MAX_NOTE_LENGTH} characters.` },
          { status: 400 }
        );
      }
      updates.push("admin_note = ?");
      values.push(admin_note.trim() || null);
    }

    // Shipping provider — empty string clears the field (e.g. if admin
    // picks the blank "-- Select courier --" option again).
    if (shipping_provider !== undefined) {
      if (shipping_provider !== "" && !isValidShippingProvider(shipping_provider)) {
        return NextResponse.json(
          { error: "shipping_provider must be one of: shiprocket, tirupati, delhivery, dtdc, other." },
          { status: 400 }
        );
      }
      updates.push("shipping_provider = ?");
      values.push(shipping_provider || null);
    }

    if (tracking_link !== undefined) {
      if (typeof tracking_link !== "string") {
        return NextResponse.json({ error: "tracking_link must be a string." }, { status: 400 });
      }
      if (tracking_link.length > MAX_TRACKING_LINK_LENGTH) {
        return NextResponse.json(
          { error: `tracking_link must be under ${MAX_TRACKING_LINK_LENGTH} characters.` },
          { status: 400 }
        );
      }
      updates.push("tracking_link = ?");
      values.push(tracking_link.trim() || null);
    }

    if (awb_number !== undefined) {
      if (typeof awb_number !== "string") {
        return NextResponse.json({ error: "awb_number must be a string." }, { status: 400 });
      }
      if (awb_number.length > MAX_AWB_LENGTH) {
        return NextResponse.json(
          { error: `awb_number must be under ${MAX_AWB_LENGTH} characters.` },
          { status: 400 }
        );
      }
      updates.push("awb_number = ?");
      values.push(awb_number.trim() || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Provide order_status, admin_note, shipping_provider, tracking_link, and/or awb_number to update." },
        { status: 400 }
      );
    }

    const existing = await getOrderByRef(orderRef);
    if (!existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    values.push(orderRef);
    await query(
      `UPDATE orders SET ${updates.join(", ")}, updated_at = NOW() WHERE order_ref = ?`,
      values
    );

    return NextResponse.json({ success: true, order_status, admin_note, shipping_provider, tracking_link, awb_number });
  } catch (err: any) {
    // Always return valid JSON, even on unexpected failure — an HTML error
    // page here would make the client show a useless generic message.
    console.error("[admin/orders PATCH]", err);
    return NextResponse.json(
      { error: err?.message || "Could not update order. Check server logs for details." },
      { status: 500 }
    );
  }
}