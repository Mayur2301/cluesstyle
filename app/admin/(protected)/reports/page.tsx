// PATH: app/admin/(protected)/reports/page.tsx
import {
  parseReportRange,
  reportRangeToQueryString,
  getReportsOverview,
  getTopProductsFull,
  getTopCustomersFull,
  getSalesByLocationFull,
} from "@/app/lib/admin-reports";
import { getDeliveryBreakdown } from "@/app/lib/admin-stats";
import { formatCurrency, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "../_components/format";
import ReportsTabs from "./ReportsTabs";
import ReportsDateRangeButton from "./ReportsDateRangeButton";
import ReportStatCard from "./ReportStatCard";
import RevenueOrdersChart from "./RevenueOrdersChart";
import DonutChart, { type DonutSlice } from "./DonutChart";
import MonthlyGrowthChart from "./MonthlyGrowthChart";
import TopProductsTable from "./TopProductsTable";
import TopCustomersTable from "./TopCustomersTable";
import SalesByCategoryTable from "./SalesByCategoryTable";
import SalesByLocationTable from "./SalesByLocationTable";
import ReportsActions from "./ReportsActions";
import { METHOD_LABELS } from "../payments/PaymentMethodBadge";

const TABS = ["overview", "orders", "customers", "products", "payments", "shipping", "marketing"] as const;
type Tab = (typeof TABS)[number];

const ORDER_STATUS_DONUT_COLORS: Record<string, string> = {
  delivered: "#22c55e",
  processing: "#3b82f6",
  shipped: "#a855f7",
  cancelled: "#9ca3af",
};

const PAYMENT_METHOD_DONUT_COLORS: Record<string, string> = {
  upi: "#8b5cf6",
  card: "#3b82f6",
  netbanking: "#06b6d4",
  wallet: "#f59e0b",
  emi: "#ec4899",
  cod: "#10b981",
  unknown: "#9ca3af",
};

function paymentMethodLabel(method: string): string {
  if (method === "cod") return "COD";
  if (method === "unknown") return "Unknown";
  return METHOD_LABELS[method] ?? method;
}

function RevenueIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
    </svg>
  );
}
function OrdersIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}
function CustomersIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
function AovIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(sp.tab ?? "") ? (sp.tab as Tab) : "overview";
  const range = parseReportRange(sp);
  const rangeQs = reportRangeToQueryString(range);

  const overview = await getReportsOverview(range);

  const [topProductsFull, topCustomersFull, salesByLocationFull, deliveryBreakdown] = await Promise.all([
    tab === "products" ? getTopProductsFull(range) : Promise.resolve(null),
    tab === "customers" ? getTopCustomersFull(range) : Promise.resolve(null),
    tab === "shipping" ? getSalesByLocationFull(range) : Promise.resolve(null),
    tab === "shipping" ? getDeliveryBreakdown() : Promise.resolve(null),
  ]);

  const statusDonutSlices: DonutSlice[] = overview.statusBreakdown.map((s) => ({
    label: ORDER_STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
    colorHex: ORDER_STATUS_DONUT_COLORS[s.status] ?? "#9ca3af",
  }));
  const totalOrdersInRange = overview.statusBreakdown.reduce((s, x) => s + x.count, 0);

  const paymentDonutSlices: DonutSlice[] = overview.paymentMethods.map((p) => ({
    label: paymentMethodLabel(p.method),
    value: p.revenue,
    colorHex: PAYMENT_METHOD_DONUT_COLORS[p.method] ?? "#9ca3af",
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Get detailed insights about your business, sales, customers and growth.</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportsDateRangeButton initialFrom={range.from} initialTo={range.to} />
          <a
            href={`/api/admin/reports/export?type=sales&${rangeQs}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 rounded-xl px-3.5 py-2 hover:bg-gray-800 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export Report
          </a>
        </div>
      </div>

      <ReportsTabs active={tab} baseQs={rangeQs} />

      {/* ── Stat cards — shown on every tab, same range, so switching tabs never loses context ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStatCard
          label="Total Revenue"
          value={formatCurrency(overview.summary.revenue)}
          changePct={overview.summary.revenueChangePct}
          iconBg="bg-green-50"
          iconText="text-green-600"
          icon={<RevenueIcon />}
        />
        <ReportStatCard
          label="Total Orders"
          value={overview.summary.orders.toLocaleString("en-IN")}
          changePct={overview.summary.ordersChangePct}
          iconBg="bg-red-50"
          iconText="text-red-500"
          icon={<OrdersIcon />}
        />
        <ReportStatCard
          label="Total Customers"
          value={overview.summary.customers.toLocaleString("en-IN")}
          changePct={overview.summary.customersChangePct}
          iconBg="bg-blue-50"
          iconText="text-blue-600"
          icon={<CustomersIcon />}
        />
        <ReportStatCard
          label="Average Order Value"
          value={formatCurrency(overview.summary.avgOrderValue)}
          changePct={overview.summary.avgOrderValueChangePct}
          iconBg="bg-purple-50"
          iconText="text-purple-600"
          icon={<AovIcon />}
        />
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-1">
              <RevenueOrdersChart data={overview.revenueByDay} />
            </div>
            <DonutChart title="Order Status" slices={statusDonutSlices} centerLabel="Total Orders" centerValue={totalOrdersInRange.toLocaleString("en-IN")} emptyText="No orders in this window yet." />
            <DonutChart title="Payment Methods" slices={paymentDonutSlices} centerLabel="Total Revenue" centerValue={formatCurrency(overview.summary.revenue)} emptyText="No paid orders in this window yet." />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <TopProductsTable products={overview.topProducts} viewAllHref="?tab=products" />
            <TopCustomersTable customers={overview.topCustomers} viewAllHref="?tab=customers" />
            <SalesByCategoryTable categories={overview.salesByCategory} viewAllHref="?tab=products" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-1">
              <SalesByLocationTable cities={overview.salesByLocation} viewAllHref="?tab=shipping" />
            </div>
            <div className="lg:col-span-1">
              <MonthlyGrowthChart data={overview.monthlyGrowth} />
            </div>
            <ReportsActions rangeQs={rangeQs} />
          </div>
        </>
      )}

      {tab === "orders" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2">
            <RevenueOrdersChart data={overview.revenueByDay} />
          </div>
          <DonutChart title="Order Status" slices={statusDonutSlices} centerLabel="Total Orders" centerValue={totalOrdersInRange.toLocaleString("en-IN")} emptyText="No orders in this window yet." />
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Order Status Breakdown</h3>
            {overview.statusBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No orders in this window yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {overview.statusBreakdown.map((s) => (
                  <div key={s.status} className={`rounded-xl border px-4 py-3 ${ORDER_STATUS_STYLES[s.status] ?? "bg-gray-50 border-gray-100"}`}>
                    <p className="text-xs font-semibold">{ORDER_STATUS_LABELS[s.status] ?? s.status}</p>
                    <p className="text-xl font-bold mt-1">{s.count}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "customers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">New vs Returning</h3>
            <p className="text-xs text-gray-400 mb-4">Among customers with a paid order in this date range.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New customers</span>
                <span className="text-lg font-bold text-gray-900">{overview.customerMix.newCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Returning customers</span>
                <span className="text-lg font-bold text-gray-900">{overview.customerMix.returningCustomers}</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <TopCustomersTable customers={topCustomersFull ?? overview.topCustomers} />
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2">
            <TopProductsTable products={topProductsFull ?? overview.topProducts} title="Top Selling Products" />
          </div>
          <SalesByCategoryTable categories={overview.salesByCategory} />
        </div>
      )}

      {tab === "payments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <DonutChart title="Payment Methods" slices={paymentDonutSlices} centerLabel="Total Revenue" centerValue={formatCurrency(overview.summary.revenue)} emptyText="No paid orders in this window yet." />
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Payment Method Breakdown</h3>
              <a href="/admin/payments" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Open Payments
              </a>
            </div>
            {overview.paymentMethods.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No paid orders in this window yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
                    <th className="font-semibold pb-2">Method</th>
                    <th className="font-semibold pb-2 text-right">Orders</th>
                    <th className="font-semibold pb-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {overview.paymentMethods.map((p) => (
                    <tr key={p.method}>
                      <td className="py-2.5 font-medium text-gray-800">{paymentMethodLabel(p.method)}</td>
                      <td className="py-2.5 text-right text-gray-600">{p.orders}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "shipping" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Delivery Method Breakdown</h3>
            <p className="text-xs text-gray-400 mb-4">All-time totals — not filtered by the date range above.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Standard Delivery</span>
                <span className="text-lg font-bold text-gray-900">{deliveryBreakdown?.standard ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Same Day Delivery</span>
                <span className="text-lg font-bold text-gray-900">{deliveryBreakdown?.sameday ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Self Pickup</span>
                <span className="text-lg font-bold text-gray-900">{deliveryBreakdown?.pickup ?? 0}</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <SalesByLocationTable cities={salesByLocationFull ?? overview.salesByLocation} />
          </div>
        </div>
      )}

      {tab === "marketing" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-sm font-semibold text-gray-700">No marketing data is tracked yet</p>
          <p className="text-sm text-gray-400 mt-1.5 max-w-md mx-auto">
            There's no coupon, campaign or ad-spend tracking in the database yet, so this tab has nothing real to show —
            rather than show made-up numbers, it's left empty until that tracking exists.
          </p>
        </div>
      )}
    </div>
  );
}