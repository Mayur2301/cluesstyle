// PATH: app/admin/(protected)/_components/TopProducts.tsx
import type { TopProduct } from "@/app/lib/admin-stats";
import { formatCurrency } from "./format";

export default function TopProducts({ products }: { products: TopProduct[] }) {
  const maxRevenue = Math.max(...products.map((p) => Number(p.revenue)), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Top products</h3>

      {products.length === 0 ? (
        <p className="text-sm text-gray-400">No paid orders yet.</p>
      ) : (
        <div className="space-y-4">
          {products.map((p) => {
            const revenue = Number(p.revenue);
            const pct = Math.round((revenue / maxRevenue) * 100);
            return (
              <div key={p.product_name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-800 truncate pr-3">{p.product_name}</span>
                  <span className="text-gray-500 whitespace-nowrap">{formatCurrency(revenue)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gray-900" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{p.orders} order{p.orders === 1 ? "" : "s"}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}