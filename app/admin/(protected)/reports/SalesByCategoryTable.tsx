// PATH: app/admin/(protected)/reports/SalesByCategoryTable.tsx
import { formatCurrency } from "../_components/format";
import type { CategorySlice } from "@/app/lib/admin-reports";

function CategoryIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

export default function SalesByCategoryTable({ categories, viewAllHref }: { categories: CategorySlice[]; viewAllHref?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Sales by Category</h3>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All
          </a>
        )}
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No paid orders in this window yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
              <th className="font-semibold pb-2">Category</th>
              <th className="font-semibold pb-2 text-right">Orders</th>
              <th className="font-semibold pb-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((c) => (
              <tr key={c.category}>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon />
                    </span>
                    <span className="font-medium text-gray-800">{c.category}</span>
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