// PATH: app/api/admin/reports/export/route.ts
// GET /api/admin/reports/export?type=sales|orders|customers|payments&from=&to=
// CSV export for the admin Reports page's "Reports Actions" download
// buttons. Same auth pattern as /api/admin/payments/export and
// /api/admin/orders/export (checks the admin session cookie itself).
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/app/lib/admin-auth";
import { query } from "@/app/lib/db";
import { parseReportRange, deriveCategory } from "@/app/lib/admin-reports";

const MAX_EXPORT_ROWS = 5000;

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header.map(csvEscape).join(",")];
  for (const row of rows) lines.push(row.map(csvEscape).join(","));
  return lines.join("\n");
}

const REPORT_TYPES = ["sales", "orders", "customers", "payments"] as const;
type ReportType = (typeof REPORT_TYPES)[number];

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type") ?? "sales";
  const type = (REPORT_TYPES as readonly string[]).includes(typeParam) ? (typeParam as ReportType) : "sales";
  const range = parseReportRange({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  let csv: string;
  let filenamePrefix: string;

  if (type === "sales") {
    filenamePrefix = "sales-report";
    const rows = await query<{ product_name: string; grand_total: string }[]>(
      `SELECT product_name, grand_total FROM orders WHERE payment_status = 'paid' AND DATE(created_at) BETWEEN ? AND ? LIMIT ${MAX_EXPORT_ROWS}`,
      [range.from, range.to]
    );
    const buckets = new Map<string, { orders: number; revenue: number }>();
    for (const r of rows) {
      const cat = deriveCategory(r.product_name);
      const cur = buckets.get(cat) ?? { orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += Number(r.grand_total);
      buckets.set(cat, cur);
    }
    csv = toCsv(
      ["Category", "Orders", "Revenue"],
      [...buckets.entries()].sort((a, b) => b[1].revenue - a[1].revenue).map(([cat, v]) => [cat, v.orders, v.revenue.toFixed(2)])
    );
  } else if (type === "orders") {
    filenamePrefix = "orders-report";
    const rows = await query<any[]>(
      `SELECT order_ref, created_at, product_name, quantity, grand_total, payment_status, order_status, delivery_type
       FROM orders WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC LIMIT ${MAX_EXPORT_ROWS}`,
      [range.from, range.to]
    );
    csv = toCsv(
      ["Order ID", "Date", "Product", "Qty", "Amount", "Payment Status", "Order Status", "Delivery Type"],
      rows.map((o) => [o.order_ref, new Date(o.created_at).toISOString(), o.product_name, o.quantity, o.grand_total, o.payment_status, o.order_status, o.delivery_type])
    );
  } else if (type === "customers") {
    filenamePrefix = "customers-report";
    const rows = await query<any[]>(
      `SELECT customer_name, customer_email, customer_phone, COUNT(*) AS orders, COALESCE(SUM(grand_total), 0) AS revenue
       FROM orders WHERE payment_status = 'paid' AND DATE(created_at) BETWEEN ? AND ?
       GROUP BY COALESCE(customer_email, customer_phone), customer_name, customer_email, customer_phone
       ORDER BY revenue DESC LIMIT ${MAX_EXPORT_ROWS}`,
      [range.from, range.to]
    );
    csv = toCsv(
      ["Customer Name", "Email", "Phone", "Orders", "Revenue"],
      rows.map((c) => [c.customer_name, c.customer_email, c.customer_phone, c.orders, Number(c.revenue).toFixed(2)])
    );
  } else {
    filenamePrefix = "payments-report";
    const rows = await query<any[]>(
      `SELECT order_ref, created_at, customer_name, grand_total, payment_status, payment_mode, payment_method
       FROM orders WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC LIMIT ${MAX_EXPORT_ROWS}`,
      [range.from, range.to]
    );
    csv = toCsv(
      ["Order ID", "Date", "Customer", "Amount", "Payment Status", "Payment Mode", "Payment Method"],
      rows.map((p) => [p.order_ref, new Date(p.created_at).toISOString(), p.customer_name, p.grand_total, p.payment_status, p.payment_mode, p.payment_method])
    );
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenamePrefix}-${range.from}-to-${range.to}.csv"`,
    },
  });
}