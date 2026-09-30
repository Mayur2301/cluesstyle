// PATH: app/lib/admin-reports.ts
// Data layer for the admin /admin/reports page. Every number here comes
// from a real query against the `orders` table (and `web_users` for
// signup counts) — nothing on this page is fabricated or hardcoded.
//
// A few things worth knowing about the schema this relies on:
//   - There is no `category` or `product_id` column on `orders` that is
//     safe to group by: several product-catalog files in app/lib/*.ts
//     accidentally reuse the same `slug`/SKU prefix across unrelated
//     categories (e.g. football/basketball/cricket/kabaddi jerseys all
//     share the same slugs, and several categories share the "OST" SKU
//     prefix). That's a pre-existing data bug in the catalog files, not
//     something fixed here — so category grouping below is done from
//     `orders.product_name` (the human-readable name captured at
//     checkout, which IS correct per order) instead of slug/SKU.
//   - `order_status` only has 4 real values in this schema: processing,
//     shipped, delivered, cancelled. There is no "pending"/"refunded"/
//     "on hold" order status — "pending"/"failed" only exist as
//     `payment_status` values. The Order Status breakdown below reports
//     the 4 real statuses rather than inventing extra ones.
//   - `payment_method` (upi/card/netbanking/wallet/emi) is Razorpay's own
//     enum and is only ever populated for the "prepaid" flow, or for the
//     5% confirmation charge on a "cod" order. COD orders are bucketed
//     under their own "cod" label since the order's actual revenue for
//     COD is the full grand_total (mostly collected in cash), not a
//     Razorpay method.
import { query } from "@/app/lib/db";

export interface ReportRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

// ─────────────────────────── date helpers ───────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

function daysBetweenInclusive(from: string, to: string): number {
  const a = new Date(from + "T00:00:00Z").getTime();
  const b = new Date(to + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000) + 1;
}

const DEFAULT_WINDOW_DAYS = 30;
const MAX_WINDOW_DAYS = 366;

function isValidIsoDate(v?: string | null): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime());
}

export function parseReportRange(searchParams: { from?: string; to?: string }): ReportRange {
  const todayIso = toISODate(new Date());
  let to = isValidIsoDate(searchParams.to) ? searchParams.to! : todayIso;
  let from = isValidIsoDate(searchParams.from) ? searchParams.from! : addDays(to, -(DEFAULT_WINDOW_DAYS - 1));
  if (from > to) [from, to] = [to, from];
  if (daysBetweenInclusive(from, to) > MAX_WINDOW_DAYS) from = addDays(to, -(MAX_WINDOW_DAYS - 1));
  return { from, to };
}

export function reportRangeToQueryString(range: ReportRange): string {
  return `from=${range.from}&to=${range.to}`;
}

function previousRange({ from, to }: ReportRange): ReportRange {
  const len = daysBetweenInclusive(from, to);
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(len - 1));
  return { from: prevFrom, to: prevTo };
}

// null = no meaningful baseline to compare against (previous period had 0)
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

// ─────────────────────────── categorisation ───────────────────────────
// See the file-header note above on why this is name-based, not slug-based.

const CATEGORY_RULES: { label: string; test: RegExp }[] = [
  { label: "Polo T-Shirts", test: /\bpolo\b/i },
  { label: "Hoodies", test: /hoodie/i },
  { label: "Jerseys", test: /jersey/i },
  { label: "Caps", test: /\bcaps?\b/i },
  { label: "T-Shirts", test: /t[-\s]?shirts?/i },
  { label: "Bags", test: /\bbags?\b|backpack/i },
  { label: "Drinkware", test: /bottles?|tumblers?|\bmugs?\b/i },
  { label: "Trophies", test: /troph(?:y|ies)/i },
  { label: "ID Cards", test: /id[-\s]?cards?/i },
  { label: "Visiting Cards", test: /visiting[-\s]?cards?/i },
  { label: "Frames", test: /\bframes?\b/i },
  { label: "Badges", test: /badges?/i },
  { label: "Umbrellas", test: /umbrellas?/i },
];

export function deriveCategory(productName: string): string {
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(productName)) return rule.label;
  }
  return "Others";
}

// ─────────────────────────── shared row types ───────────────────────────

interface SummaryRow {
  orders: number;
  paid_orders: number;
  revenue: string;
  customers: number;
}

export interface ReportSummary {
  revenue: number;
  revenueChangePct: number | null;
  orders: number;
  ordersChangePct: number | null;
  customers: number;
  customersChangePct: number | null;
  avgOrderValue: number;
  avgOrderValueChangePct: number | null;
}

export interface DayPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusSlice {
  status: string;
  count: number;
}

export interface PaymentMethodSlice {
  method: string;
  orders: number;
  revenue: number;
}

export interface TopProductRow {
  product_name: string;
  orders: number;
  revenue: number;
}

export interface TopCustomerRow {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  orders: number;
  revenue: number;
}

export interface CategorySlice {
  category: string;
  orders: number;
  revenue: number;
}

export interface CitySlice {
  city: string;
  orders: number;
  revenue: number;
}

export interface MonthPoint {
  month: string; // YYYY-MM
  revenue: number;
  orders: number;
}

async function getSummary(range: ReportRange): Promise<ReportSummary> {
  const sql = `
    SELECT
      COUNT(*) AS orders,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_orders,
      COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN grand_total ELSE 0 END), 0) AS revenue,
      COUNT(DISTINCT COALESCE(customer_email, customer_phone)) AS customers
    FROM orders
    WHERE DATE(created_at) BETWEEN ? AND ?
  `;
  const prev = previousRange(range);
  const [curRows, prevRows] = await Promise.all([
    query<SummaryRow[]>(sql, [range.from, range.to]),
    query<SummaryRow[]>(sql, [prev.from, prev.to]),
  ]);

  const cur = curRows[0] ?? { orders: 0, paid_orders: 0, revenue: "0", customers: 0 };
  const prv = prevRows[0] ?? { orders: 0, paid_orders: 0, revenue: "0", customers: 0 };

  const revenue = Number(cur.revenue);
  const prevRevenue = Number(prv.revenue);
  const orders = Number(cur.orders);
  const prevOrders = Number(prv.orders);
  const customers = Number(cur.customers);
  const prevCustomers = Number(prv.customers);
  const paidOrders = Number(cur.paid_orders ?? 0);
  const prevPaidOrders = Number(prv.paid_orders ?? 0);
  const avgOrderValue = paidOrders > 0 ? revenue / paidOrders : 0;
  const prevAvgOrderValue = prevPaidOrders > 0 ? prevRevenue / prevPaidOrders : 0;

  return {
    revenue,
    revenueChangePct: pctChange(revenue, prevRevenue),
    orders,
    ordersChangePct: pctChange(orders, prevOrders),
    customers,
    customersChangePct: pctChange(customers, prevCustomers),
    avgOrderValue,
    avgOrderValueChangePct: pctChange(avgOrderValue, prevAvgOrderValue),
  };
}

async function getRevenueOrdersByDay(range: ReportRange): Promise<DayPoint[]> {
  const rows = await query<{ d: string | Date; revenue: string; orders: number }[]>(
    `SELECT DATE(created_at) AS d,
       COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN grand_total ELSE 0 END), 0) AS revenue,
       COUNT(*) AS orders
     FROM orders
     WHERE DATE(created_at) BETWEEN ? AND ?
     GROUP BY DATE(created_at)
     ORDER BY d ASC`,
    [range.from, range.to]
  );
  const byDate = new Map(
    rows.map((r) => [
      r.d instanceof Date ? r.d.toISOString().slice(0, 10) : String(r.d).slice(0, 10),
      { revenue: Number(r.revenue), orders: Number(r.orders) },
    ])
  );
  const out: DayPoint[] = [];
  const total = daysBetweenInclusive(range.from, range.to);
  for (let i = 0; i < total; i++) {
    const date = addDays(range.from, i);
    const point = byDate.get(date);
    out.push({ date, revenue: point?.revenue ?? 0, orders: point?.orders ?? 0 });
  }
  return out;
}

async function getStatusBreakdown(range: ReportRange): Promise<StatusSlice[]> {
  const rows = await query<{ order_status: string; c: number }[]>(
    `SELECT order_status, COUNT(*) AS c FROM orders WHERE DATE(created_at) BETWEEN ? AND ? GROUP BY order_status`,
    [range.from, range.to]
  );
  return rows.map((r) => ({ status: r.order_status, count: Number(r.c) }));
}

async function getPaymentMethodBreakdown(range: ReportRange): Promise<PaymentMethodSlice[]> {
  const rows = await query<{ payment_mode: string; payment_method: string | null; grand_total: string }[]>(
    `SELECT payment_mode, payment_method, grand_total
     FROM orders
     WHERE payment_status = 'paid' AND DATE(created_at) BETWEEN ? AND ?`,
    [range.from, range.to]
  );
  const buckets = new Map<string, { orders: number; revenue: number }>();
  for (const r of rows) {
    const key = r.payment_mode === "cod" ? "cod" : r.payment_method ?? "unknown";
    const cur = buckets.get(key) ?? { orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += Number(r.grand_total);
    buckets.set(key, cur);
  }
  return [...buckets.entries()]
    .map(([method, v]) => ({ method, orders: v.orders, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

async function getTopProducts(range: ReportRange, limit: number): Promise<TopProductRow[]> {
  const rows = await query<{ product_name: string; orders: number; revenue: string }[]>(
    `SELECT product_name, COUNT(*) AS orders, COALESCE(SUM(grand_total), 0) AS revenue
     FROM orders
     WHERE payment_status = 'paid' AND DATE(created_at) BETWEEN ? AND ?
     GROUP BY product_name
     ORDER BY revenue DESC
     LIMIT ${Number(limit)}`,
    [range.from, range.to]
  );
  return rows.map((r) => ({ product_name: r.product_name, orders: Number(r.orders), revenue: Number(r.revenue) }));
}

async function getTopCustomers(range: ReportRange, limit: number): Promise<TopCustomerRow[]> {
  const rows = await query<{ customer_name: string; customer_email: string | null; customer_phone: string; orders: number; revenue: string }[]>(
    `SELECT customer_name, customer_email, customer_phone,
       COUNT(*) AS orders, COALESCE(SUM(grand_total), 0) AS revenue
     FROM orders
     WHERE payment_status = 'paid' AND DATE(created_at) BETWEEN ? AND ?
     GROUP BY COALESCE(customer_email, customer_phone), customer_name, customer_email, customer_phone
     ORDER BY revenue DESC
     LIMIT ${Number(limit)}`,
    [range.from, range.to]
  );
  return rows.map((r) => ({
    customer_name: r.customer_name,
    customer_email: r.customer_email,
    customer_phone: r.customer_phone,
    orders: Number(r.orders),
    revenue: Number(r.revenue),
  }));
}

async function getSalesByCategory(range: ReportRange): Promise<CategorySlice[]> {
  const rows = await query<{ product_name: string; grand_total: string }[]>(
    `SELECT product_name, grand_total FROM orders WHERE payment_status = 'paid' AND DATE(created_at) BETWEEN ? AND ?`,
    [range.from, range.to]
  );
  const buckets = new Map<string, { orders: number; revenue: number }>();
  for (const r of rows) {
    const category = deriveCategory(r.product_name);
    const cur = buckets.get(category) ?? { orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += Number(r.grand_total);
    buckets.set(category, cur);
  }
  return [...buckets.entries()]
    .map(([category, v]) => ({ category, orders: v.orders, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

async function getSalesByLocation(range: ReportRange, limit: number): Promise<CitySlice[]> {
  const rows = await query<{ city: string; orders: number; revenue: string }[]>(
    `SELECT address_city AS city, COUNT(*) AS orders, COALESCE(SUM(grand_total), 0) AS revenue
     FROM orders
     WHERE payment_status = 'paid' AND DATE(created_at) BETWEEN ? AND ?
     GROUP BY address_city
     ORDER BY revenue DESC
     LIMIT ${Number(limit)}`,
    [range.from, range.to]
  );
  return rows.map((r) => ({ city: r.city || "Unknown", orders: Number(r.orders), revenue: Number(r.revenue) }));
}

const MONTHLY_GROWTH_MONTHS = 6;

async function getMonthlyGrowth(): Promise<MonthPoint[]> {
  const rows = await query<{ ym: string; revenue: string; orders: number }[]>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym,
       COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN grand_total ELSE 0 END), 0) AS revenue,
       COUNT(*) AS orders
     FROM orders
     WHERE created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL ${MONTHLY_GROWTH_MONTHS - 1} MONTH)
     GROUP BY ym
     ORDER BY ym ASC`
  );
  const byMonth = new Map(rows.map((r) => [r.ym, { revenue: Number(r.revenue), orders: Number(r.orders) }]));
  const out: MonthPoint[] = [];
  const now = new Date();
  for (let i = MONTHLY_GROWTH_MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = byMonth.get(key);
    out.push({ month: key, revenue: point?.revenue ?? 0, orders: point?.orders ?? 0 });
  }
  return out;
}

// New vs returning, among customers who ordered (paid) within the range:
// "returning" = they also have an earlier paid order dated before `from`.
export interface CustomerMixRow {
  newCustomers: number;
  returningCustomers: number;
}

async function getCustomerMix(range: ReportRange): Promise<CustomerMixRow> {
  const rows = await query<{ key: string; earliest_paid: string | Date }[]>(
    `SELECT COALESCE(customer_email, customer_phone) AS \`key\`, MIN(created_at) AS earliest_paid
     FROM orders
     WHERE payment_status = 'paid'
     GROUP BY \`key\``
  );
  const inRange = await query<{ key: string }[]>(
    `SELECT DISTINCT COALESCE(customer_email, customer_phone) AS \`key\`
     FROM orders
     WHERE payment_status = 'paid' AND DATE(created_at) BETWEEN ? AND ?`,
    [range.from, range.to]
  );
  const firstOrderDate = new Map(
    rows.map((r) => [r.key, r.earliest_paid instanceof Date ? r.earliest_paid.toISOString().slice(0, 10) : String(r.earliest_paid).slice(0, 10)])
  );
  let newCustomers = 0;
  let returningCustomers = 0;
  for (const r of inRange) {
    const first = firstOrderDate.get(r.key);
    if (first && first < range.from) returningCustomers += 1;
    else newCustomers += 1;
  }
  return { newCustomers, returningCustomers };
}

export interface ReportsOverview {
  range: ReportRange;
  summary: ReportSummary;
  revenueByDay: DayPoint[];
  statusBreakdown: StatusSlice[];
  paymentMethods: PaymentMethodSlice[];
  topProducts: TopProductRow[];
  topCustomers: TopCustomerRow[];
  salesByCategory: CategorySlice[];
  salesByLocation: CitySlice[];
  monthlyGrowth: MonthPoint[];
  customerMix: CustomerMixRow;
}

export async function getReportsOverview(range: ReportRange): Promise<ReportsOverview> {
  const [summary, revenueByDay, statusBreakdown, paymentMethods, topProducts, topCustomers, salesByCategory, salesByLocation, monthlyGrowth, customerMix] =
    await Promise.all([
      getSummary(range),
      getRevenueOrdersByDay(range),
      getStatusBreakdown(range),
      getPaymentMethodBreakdown(range),
      getTopProducts(range, 5),
      getTopCustomers(range, 5),
      getSalesByCategory(range),
      getSalesByLocation(range, 5),
      getMonthlyGrowth(),
      getCustomerMix(range),
    ]);

  return {
    range,
    summary,
    revenueByDay,
    statusBreakdown,
    paymentMethods,
    topProducts,
    topCustomers,
    salesByCategory,
    salesByLocation,
    monthlyGrowth,
    customerMix,
  };
}

// Fuller lists for the Products/Customers tabs (same underlying queries,
// just not capped at 5).
export async function getTopProductsFull(range: ReportRange): Promise<TopProductRow[]> {
  return getTopProducts(range, 25);
}
export async function getTopCustomersFull(range: ReportRange): Promise<TopCustomerRow[]> {
  return getTopCustomers(range, 25);
}
export async function getSalesByLocationFull(range: ReportRange): Promise<CitySlice[]> {
  return getSalesByLocation(range, 20);
}