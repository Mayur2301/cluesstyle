// PATH: app/lib/admin-stats.ts
import { query } from "@/app/lib/db";

export interface RecentOrder {
  order_ref: string;
  customer_name: string;
  product_name: string;
  quantity: number | null;
  grand_total: string; // DECIMAL columns come back as strings from mysql2
  payment_status: "pending" | "paid" | "failed";
  order_status: "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  design_pdf_url: string | null;
  // Delivery method — "pickup" orders never get a courier booking (see
  // verify-razorpay-payment.ts), so this is the ONLY way to know a pickup
  // order exists; it won't show up in Shiprocket/Delhivery at all.
  delivery_type: "standard" | "sameday" | "pickup";
  // "cod" orders only had 5% charged via Razorpay (advance_amount) —
  // cod_due_amount is the balance still to collect in cash on delivery.
  payment_mode: "prepaid" | "cod";
  advance_amount: number;
  cod_due_amount: number;
}

export interface TopProduct {
  product_name: string;
  orders: number;
  revenue: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  avgOrderValue: number;
  statusBreakdown: { status: string; count: number }[];
  // Counts by delivery method — drives the 3 delivery-mode summary cards on
  // the dashboard (Standard / Same Day / Self Pickup).
  deliveryBreakdown: { standard: number; sameday: number; pickup: number };
  // Orders placed today vs. yesterday, for the "+X% vs yesterday" trend
  // badge next to Total Orders. `null` when there's no order yesterday to
  // compare against (division by zero) — the UI hides the badge in that case.
  ordersToday: number;
  ordersYesterday: number;
  revenueByDay: { date: string; revenue: number }[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

const DAYS_IN_CHART = 14;
// How many recent orders to hand to the dashboard's client-side "Recent
// Orders" panel (tabs + search + pagination all run in the browser over
// this window, same pattern as the plain /admin/orders list but capped
// smaller since this is a dashboard summary, not the full order log).
const RECENT_ORDERS_WINDOW = 60;

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    revenueRows,
    orderCountRows,
    paidCountRows,
    pendingCountRows,
    failedCountRows,
    customerCountRows,
    newCustomerRows,
    statusRows,
    deliveryRows,
    ordersTodayRows,
    ordersYesterdayRows,
    revenueByDayRows,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    query<{ revenue: string }[]>(
      `SELECT COALESCE(SUM(grand_total), 0) AS revenue FROM orders WHERE payment_status = 'paid'`
    ),
    query<{ c: number }[]>(`SELECT COUNT(*) AS c FROM orders`),
    query<{ c: number }[]>(`SELECT COUNT(*) AS c FROM orders WHERE payment_status = 'paid'`),
    query<{ c: number }[]>(`SELECT COUNT(*) AS c FROM orders WHERE payment_status = 'pending'`),
    query<{ c: number }[]>(`SELECT COUNT(*) AS c FROM orders WHERE payment_status = 'failed'`),
    query<{ c: number }[]>(`SELECT COUNT(*) AS c FROM web_users`),
    query<{ c: number }[]>(
      `SELECT COUNT(*) AS c FROM web_users WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`
    ),
    query<{ order_status: string; c: number }[]>(
      `SELECT order_status, COUNT(*) AS c FROM orders GROUP BY order_status`
    ),
    query<{ delivery_type: string; c: number }[]>(
      `SELECT delivery_type, COUNT(*) AS c FROM orders GROUP BY delivery_type`
    ),
    query<{ c: number }[]>(
      `SELECT COUNT(*) AS c FROM orders WHERE DATE(created_at) = CURDATE()`
    ),
    query<{ c: number }[]>(
      `SELECT COUNT(*) AS c FROM orders WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY`
    ),
    query<{ d: string | Date; revenue: string }[]>(
      `SELECT DATE(created_at) AS d, COALESCE(SUM(grand_total), 0) AS revenue
       FROM orders
       WHERE payment_status = 'paid' AND created_at >= NOW() - INTERVAL ${DAYS_IN_CHART - 1} DAY
       GROUP BY DATE(created_at)
       ORDER BY d ASC`
    ),
    query<RecentOrder[]>(
      `SELECT order_ref, customer_name, product_name, quantity, grand_total, payment_status, order_status, created_at, design_pdf_url, delivery_type, payment_mode, advance_amount, cod_due_amount
       FROM orders
       ORDER BY created_at DESC
       LIMIT ${RECENT_ORDERS_WINDOW}`
    ),
    query<TopProduct[]>(
      `SELECT product_name, COUNT(*) AS orders, COALESCE(SUM(grand_total), 0) AS revenue
       FROM orders
       WHERE payment_status = 'paid'
       GROUP BY product_name
       ORDER BY revenue DESC
       LIMIT 5`
    ),
  ]);

  const totalRevenue = Number(revenueRows[0]?.revenue ?? 0);
  const paidOrders = Number(paidCountRows[0]?.c ?? 0);

  // Fill in every day of the window (even ones with zero revenue) so the
  // chart doesn't silently skip quiet days.
  const revenueByDate = new Map(
    revenueByDayRows.map((r) => [r.d instanceof Date ? r.d.toISOString().slice(0, 10) : String(r.d).slice(0, 10), Number(r.revenue)])
  );
  const revenueByDay: { date: string; revenue: number }[] = [];
  for (let i = DAYS_IN_CHART - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    revenueByDay.push({ date: key, revenue: revenueByDate.get(key) ?? 0 });
  }

  const deliveryBreakdown = { standard: 0, sameday: 0, pickup: 0 };
  for (const row of deliveryRows) {
    if (row.delivery_type === "standard" || row.delivery_type === "sameday" || row.delivery_type === "pickup") {
      deliveryBreakdown[row.delivery_type] = Number(row.c);
    }
  }

  return {
    totalRevenue,
    totalOrders: Number(orderCountRows[0]?.c ?? 0),
    paidOrders,
    pendingOrders: Number(pendingCountRows[0]?.c ?? 0),
    failedOrders: Number(failedCountRows[0]?.c ?? 0),
    totalCustomers: Number(customerCountRows[0]?.c ?? 0),
    newCustomersThisMonth: Number(newCustomerRows[0]?.c ?? 0),
    avgOrderValue: paidOrders > 0 ? totalRevenue / paidOrders : 0,
    statusBreakdown: statusRows.map((r) => ({ status: r.order_status, count: Number(r.c) })),
    deliveryBreakdown,
    ordersToday: Number(ordersTodayRows[0]?.c ?? 0),
    ordersYesterday: Number(ordersYesterdayRows[0]?.c ?? 0),
    revenueByDay,
    recentOrders,
    topProducts,
  };
}
// Lightweight count for the admin header's notification bell badge —
// orders still awaiting payment confirmation. Deliberately not the full
// getDashboardStats() (which runs ~10 queries) since this runs on every
// admin page load via the shared layout, not just the dashboard.
export async function getPendingOrdersCount(): Promise<number> {
  const rows = await query<{ c: number }[]>(
    `SELECT COUNT(*) AS c FROM orders WHERE payment_status = 'pending'`
  );
  return Number(rows[0]?.c ?? 0);
}

// Standalone delivery-type counts — used by both the dashboard summary
// cards and the /admin/orders page's filter cards/tabs. Kept separate from
// getDashboardStats() so the orders list (loaded far more often) doesn't
// pay for the other ~9 dashboard-only queries.
export async function getDeliveryBreakdown(): Promise<{ standard: number; sameday: number; pickup: number; all: number }> {
  const rows = await query<{ delivery_type: string; c: number }[]>(
    `SELECT delivery_type, COUNT(*) AS c FROM orders GROUP BY delivery_type`
  );
  const breakdown = { standard: 0, sameday: 0, pickup: 0, all: 0 };
  for (const row of rows) {
    if (row.delivery_type === "standard" || row.delivery_type === "sameday" || row.delivery_type === "pickup") {
      breakdown[row.delivery_type] = Number(row.c);
      breakdown.all += Number(row.c);
    }
  }
  return breakdown;
}