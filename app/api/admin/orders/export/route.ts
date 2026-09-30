// PATH: app/api/admin/orders/export/route.ts
// GET /api/admin/orders/export?<same filters as /admin/orders> — streams a
// CSV of every order matching the current filters (not just the visible
// page), for the "Export" button on the orders list.
//
// NOTE: this route is NOT covered by app/middleware.ts — that middleware's
// matcher only protects /account and /dashboard/:path*, not /api/admin/**
// (despite a comment elsewhere in this codebase claiming otherwise; that
// comment is wrong and every /api/admin/** route should be double-checked).
// So this route verifies the admin session cookie itself rather than
// relying on middleware.
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/app/lib/admin-auth";
import { query } from "@/app/lib/db";
import { parseOrderFilters, buildOrderWhere } from "@/app/lib/admin-order-filters";

const MAX_EXPORT_ROWS = 5000;

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = parseOrderFilters({
    q: searchParams.get("q") ?? undefined,
    delivery: searchParams.get("delivery") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    payment: searchParams.get("payment") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
  const { whereSql, params } = buildOrderWhere(filters);

  const rows = await query<any[]>(
    `SELECT order_ref, created_at, customer_name, customer_phone, customer_email, product_name, quantity,
            selected_color, selected_size, grand_total, payment_status, payment_mode, delivery_type,
            order_status, shipping_provider, awb_number, tracking_link
     FROM orders
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT ${MAX_EXPORT_ROWS}`,
    params
  );

  const header = [
    "Order ID", "Date", "Customer", "Phone", "Email", "Product", "Colour", "Size", "Qty",
    "Total", "Payment Status", "Payment Mode", "Delivery Type", "Order Status",
    "Shipping Provider", "AWB", "Tracking Link",
  ];
  const lines = [header.map(csvEscape).join(",")];
  for (const o of rows) {
    lines.push(
      [
        o.order_ref, new Date(o.created_at).toISOString(), o.customer_name, o.customer_phone, o.customer_email,
        o.product_name, o.selected_color, o.selected_size, o.quantity, o.grand_total, o.payment_status,
        o.payment_mode, o.delivery_type, o.order_status, o.shipping_provider, o.awb_number, o.tracking_link,
      ]
        .map(csvEscape)
        .join(",")
    );
  }
  const csv = lines.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}