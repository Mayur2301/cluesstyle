// PATH: app/admin/(protected)/_components/RecentOrdersTable.tsx
import Link from "next/link";
import type { RecentOrder } from "@/app/lib/admin-stats";
import { formatCurrency, formatDate, PAYMENT_STATUS_STYLES, ORDER_STATUS_STYLES, ORDER_STATUS_LABELS } from "./format";

export default function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Recent orders</h3>
        <Link href="/admin/orders" className="text-xs font-medium text-gray-500 hover:text-gray-900">
          View all →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">No orders yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-2.5 font-medium">Order</th>
                <th className="px-5 py-2.5 font-medium">Customer</th>
                <th className="px-5 py-2.5 font-medium">Product</th>
                <th className="px-5 py-2.5 font-medium">Total</th>
                <th className="px-5 py-2.5 font-medium">Payment</th>
                <th className="px-5 py-2.5 font-medium">Delivery</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.order_ref} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-medium whitespace-nowrap">
                    <Link href={`/admin/orders/${o.order_ref}`} className="text-gray-900 hover:underline">
                      {o.order_ref}
                    </Link>
                    {o.design_pdf_url && (
                      <span className="ml-2 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-2 py-0.5">
                        🎨
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{o.customer_name}</td>
                  <td className="px-5 py-3 text-gray-600 max-w-[220px] truncate">
                    {o.product_name}
                    {o.quantity ? <span className="text-gray-400"> ×{o.quantity}</span> : null}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {formatCurrency(Number(o.grand_total))}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${PAYMENT_STATUS_STYLES[o.payment_status]}`}
                    >
                      {o.payment_status}
                    </span>
                    {o.payment_mode === "cod" && (
                      <span className="block mt-1 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5 w-fit">
                        COD · due {formatCurrency(o.cod_due_amount)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    {o.delivery_type === "sameday" ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full border bg-green-50 text-green-700 border-green-100">
                        Same Day
                      </span>
                    ) : o.delivery_type === "pickup" ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                        Self Pickup
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${ORDER_STATUS_STYLES[o.order_status]}`}
                    >
                      {ORDER_STATUS_LABELS[o.order_status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}