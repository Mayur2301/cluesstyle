// PATH: app/admin/(protected)/reports/TopCustomersTable.tsx
import { formatCurrency } from "../_components/format";
import type { TopCustomerRow } from "@/app/lib/admin-reports";

const AVATAR_COLORS = ["bg-amber-100 text-amber-700", "bg-red-100 text-red-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-green-100 text-green-700"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TopCustomersTable({ customers, viewAllHref }: { customers: TopCustomerRow[]; viewAllHref?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Top Customers</h3>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All
          </a>
        )}
      </div>
      {customers.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No paid orders in this window yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
              <th className="font-semibold pb-2 w-8">#</th>
              <th className="font-semibold pb-2">Customer</th>
              <th className="font-semibold pb-2 text-right">Orders</th>
              <th className="font-semibold pb-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((c, i) => (
              <tr key={c.customer_email ?? c.customer_phone}>
                <td className="py-2.5 text-gray-400 font-medium">{i + 1}</td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {initials(c.customer_name)}
                    </span>
                    <span className="font-medium text-gray-800 truncate max-w-[160px]">{c.customer_name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right text-gray-600">{c.orders}</td>
                <td className="py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(c.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}