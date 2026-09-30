// PATH: app/admin/(protected)/reports/TopProductsTable.tsx
import { formatCurrency } from "../_components/format";
import type { TopProductRow } from "@/app/lib/admin-reports";

const RANK_ICON_BG = ["bg-gray-900", "bg-gray-400", "bg-amber-600", "bg-gray-200", "bg-gray-200"];

export default function TopProductsTable({ products, title = "Top Selling Products", viewAllHref }: { products: TopProductRow[]; title?: string; viewAllHref?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All
          </a>
        )}
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No paid orders in this window yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
              <th className="font-semibold pb-2 w-8">#</th>
              <th className="font-semibold pb-2">Product</th>
              <th className="font-semibold pb-2 text-right">Orders</th>
              <th className="font-semibold pb-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p, i) => (
              <tr key={p.product_name}>
                <td className="py-2.5">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold text-white ${RANK_ICON_BG[i] ?? "bg-gray-200"}`}>{i + 1}</span>
                </td>
                <td className="py-2.5 font-medium text-gray-800 pr-3 truncate max-w-[220px]">{p.product_name}</td>
                <td className="py-2.5 text-right text-gray-600">{p.orders}</td>
                <td className="py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}