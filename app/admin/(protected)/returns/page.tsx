// PATH: app/admin/(protected)/returns/page.tsx
import Link from "next/link";
import { listReturnRequests, parseReturnItems, RETURN_REASONS } from "@/app/lib/return-orders";
import { formatDateTime, formatCurrency } from "../_components/format";
import ReturnStatusControl from "./ReturnStatusControl";

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-blue-50 text-blue-700 border-blue-100",
  picked_up: "bg-purple-50 text-purple-700 border-purple-100",
  refunded: "bg-green-50 text-green-700 border-green-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

function reasonLabel(value: string): string {
  return RETURN_REASONS.find((r) => r.value === value)?.label || value;
}

export default async function AdminReturnsPage() {
  const returns = await listReturnRequests();

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Requests raised through the customer-facing{" "}
          <Link href="/return-order" target="_blank" className="underline">
            /return-order
          </Link>{" "}
          page.
        </p>
      </div>

      {returns.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-sm text-gray-500">
          No return requests yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-3">Return / Order</th>
                <th className="text-left font-medium px-4 py-3">Customer</th>
                <th className="text-left font-medium px-4 py-3">Items</th>
                <th className="text-left font-medium px-4 py-3">Reason</th>
                <th className="text-left font-medium px-4 py-3">Raised</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map((r) => {
                const items = parseReturnItems(r.items);
                return (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-4">
                      <Link href={`/admin/orders/${r.order_ref}`} className="font-semibold text-gray-900 hover:underline">
                        {r.return_ref}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">Order: {r.order_ref}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{r.customer_name}</p>
                      <p className="text-xs text-gray-400">{r.customer_phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      {items.map((it) => (
                        <p key={it.order_ref} className="text-xs text-gray-700">
                          {it.product_name} × {it.quantity}
                        </p>
                      ))}
                      {r.refund_amount != null && (
                        <p className="text-xs text-gray-400 mt-1">Refund: {formatCurrency(Number(r.refund_amount))}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-gray-700">{reasonLabel(r.reason)}</p>
                      {r.reason_note && <p className="text-xs text-gray-400 mt-0.5 max-w-xs">{r.reason_note}</p>}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDateTime(r.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex text-xs font-medium border rounded-full px-2.5 py-1 mb-2 ${
                          STATUS_STYLES[r.status] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                      <ReturnStatusControl returnRef={r.return_ref} currentStatus={r.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
