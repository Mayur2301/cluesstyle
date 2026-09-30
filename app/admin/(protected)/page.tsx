// PATH: app/admin/(protected)/page.tsx
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/app/lib/admin-auth";
import { getDashboardStats } from "@/app/lib/admin-stats";
import DeliveryTypeCards from "./_components/DeliveryTypeCards";
import MiniStatRow from "./_components/MiniStatRow";
import RecentOrdersPanel from "./_components/RecentOrdersPanel";
import RevenueChart from "./_components/RevenueChart";
import TopProducts from "./_components/TopProducts";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;

  const stats = await getDashboardStats();

  const statusCount = (status: string) =>
    stats.statusBreakdown.find((s) => s.status === status)?.count ?? 0;

  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {session?.name?.split(" ")[0] ?? "admin"}! Here's what's happening today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-3.5 py-2 w-fit">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Today, {today}
        </div>
      </div>

      {/* Delivery mode summary */}
      <DeliveryTypeCards
        standard={stats.deliveryBreakdown.standard}
        sameday={stats.deliveryBreakdown.sameday}
        pickup={stats.deliveryBreakdown.pickup}
      />

      {/* Order status summary */}
      <MiniStatRow
        totalOrders={stats.totalOrders}
        ordersToday={stats.ordersToday}
        ordersYesterday={stats.ordersYesterday}
        processing={statusCount("processing")}
        shipped={statusCount("shipped")}
        delivered={statusCount("delivered")}
        cancelled={statusCount("cancelled")}
      />

      {/* Recent orders — tabs by delivery type, search, pagination */}
      <RecentOrdersPanel orders={stats.recentOrders} />

      {/* Revenue trend + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={stats.revenueByDay} />
        </div>
        <TopProducts products={stats.topProducts} />
      </div>
    </div>
  );
}