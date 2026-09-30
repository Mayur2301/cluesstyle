// PATH: app/api/admin/payments/export/route.ts
// GET /api/admin/payments/export?<same filters as /admin/payments> — CSV of
// every payment matching the current filters, mirroring
// /api/admin/orders/export's shape and auth (see that file for why this
// checks the admin session itself rather than relying on middleware.ts).
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/app/lib/admin-auth";
import { query } from "@/app/lib/db";
import { parsePaymentFilters, buildPaymentWhere } from "@/app/lib/admin-payment-filters";

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
  const filters = parsePaymentFilters({
    q: searchParams.get("q") ?? undefined,
    method: searchParams.get("method") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    mode: searchParams.get("mode") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
  const { whereSql, params } = buildPaymentWhere(filters);

  const rows = await query<any[]>(
    `SELECT order_ref, created_at, customer_name, grand_total, payment_status, payment_mode, payment_method,
            advance_amount, cod_due_amount, razorpay_payment_id, delivery_type
     FROM orders
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT ${MAX_EXPORT_ROWS}`,
    params
  );

  const header = [
    "Order ID", "Date", "Customer", "Amount", "Payment Status", "Payment Mode", "Payment Method",
    "Advance Collected", "COD Due", "Transaction ID", "Order Type",
  ];
  const lines = [header.map(csvEscape).join(",")];
  for (const o of rows) {
    lines.push(
      [
        o.order_ref, new Date(o.created_at).toISOString(), o.customer_name, o.grand_total, o.payment_status,
        o.payment_mode, o.payment_method, o.advance_amount, o.cod_due_amount, o.razorpay_payment_id, o.delivery_type,
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
      "Content-Disposition": `attachment; filename="payments-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}