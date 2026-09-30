// PATH: app/admin/(protected)/reports/SalesByLocationTable.tsx
import { formatCurrency } from "../_components/format";
import type { CitySlice } from "@/app/lib/admin-reports";

export default function SalesByLocationTable({ cities, viewAllHref }: { cities: CitySlice[]; viewAllHref?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Sales by Location (Top Cities)</h3>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All
          </a>
        )}
      </div>
      {cities.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No paid orders in this window yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
              <th className="font-semibold pb-2 w-8">#</th>
              <th className="font-semibold pb-2">City</th>
              <th className="font-semibold pb-2 text-right">Orders</th>
              <th className="font-semibold pb-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cities.map((c, i) => (
              <tr key={c.city}>
                <td className="py-2.5 text-gray-400 font-medium">{i + 1}</td>
                <td className="py-2.5 font-medium text-gray-800 pr-3">{c.city}</td>
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