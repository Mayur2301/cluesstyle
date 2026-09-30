// PATH: app/admin/(protected)/_components/RecentOrdersPanel.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { RecentOrder } from "@/app/lib/admin-stats";
import {
  formatCurrency,
  formatDateTime,
  ORDER_STATUS_STYLES,
  ORDER_STATUS_LABELS,
  DELIVERY_TYPE_STYLES,
  DELIVERY_TYPE_LABELS,
} from "./format";

const PAGE_SIZE = 8;

type DeliveryFilter = "all" | "standard" | "sameday" | "pickup";

function DeliveryBadge({ type }: { type: RecentOrder["delivery_type"] }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${DELIVERY_TYPE_STYLES[type]}`}>
      {DELIVERY_TYPE_LABELS[type]}
    </span>
  );
}

export default function RecentOrdersPanel({ orders }: { orders: RecentOrder[] }) {
  const [tab, setTab] = useState<DeliveryFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuRef, setOpenMenuRef] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { all: orders.length, standard: 0, sameday: 0, pickup: 0 };
    for (const o of orders) c[o.delivery_type]++;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    let result = tab === "all" ? orders : orders.filter((o) => o.delivery_type === tab);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (o) =>
          o.order_ref.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.product_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeTab = (t: DeliveryFilter) => {
    setTab(t);
    setPage(1);
  };

  const TABS: { key: DeliveryFilter; label: string }[] = [
    { key: "all", label: `All Orders (${counts.all})` },
    { key: "standard", label: `Standard (${counts.standard})` },
    { key: "sameday", label: `Same Day (${counts.sameday})` },
    { key: "pickup", label: `Self Pickup (${counts.pickup})` },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Recent Orders</h3>
        <Link href="/admin/orders" className="text-xs font-medium text-blue-600 hover:text-blue-700">
          View All Orders →
        </Link>
      </div>

      <div className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => changeTab(t.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                tab === t.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto flex-1 sm:flex-initial sm:w-64">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by order ID, customer..."
              className="w-full h-8 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {pageOrders.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">No orders match this filter.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-2.5 font-medium">Order ID</th>
                <th className="px-5 py-2.5 font-medium">Date &amp; Time</th>
                <th className="px-5 py-2.5 font-medium">Customer</th>
                <th className="px-5 py-2.5 font-medium">Delivery Type</th>
                <th className="px-5 py-2.5 font-medium">Items</th>
                <th className="px-5 py-2.5 font-medium">Amount</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageOrders.map((o) => (
                <tr key={o.order_ref} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-medium whitespace-nowrap">
                    <Link href={`/admin/orders/${o.order_ref}`} className="text-blue-600 hover:underline">
                      {o.order_ref}
                    </Link>
                    {o.design_pdf_url && (
                      <span className="ml-2 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-2 py-0.5">
                        🎨
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(o.created_at)}</td>
                  <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                    <div className="font-medium">{o.customer_name}</div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <DeliveryBadge type={o.delivery_type} />
                  </td>
                  <td className="px-5 py-3 text-gray-600 max-w-[200px]">
                    <div className="truncate">{o.product_name}</div>
                    {o.quantity ? <div className="text-xs text-gray-400">{o.quantity} pcs</div> : null}
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(Number(o.grand_total))}
                    {o.payment_mode === "cod" && (
                      <span className="block mt-1 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5 w-fit">
                        COD
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${ORDER_STATUS_STYLES[o.order_status]}`}>
                      {ORDER_STATUS_LABELS[o.order_status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-right relative">
                    <button
                      onClick={() => setOpenMenuRef(openMenuRef === o.order_ref ? null : o.order_ref)}
                      className="w-7 h-7 rounded-lg hover:bg-gray-100 inline-flex items-center justify-center text-gray-400"
                      aria-label="Actions"
                    >
                      •••
                    </button>
                    {openMenuRef === o.order_ref && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuRef(null)} />
                        <div className="absolute right-5 mt-1 w-40 bg-white rounded-lg border border-gray-100 shadow-lg z-20 text-left overflow-hidden">
                          <Link
                            href={`/admin/orders/${o.order_ref}`}
                            className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpenMenuRef(null)}
                          >
                            View details
                          </Link>
                          {o.design_pdf_url && (
                            <a
                              href={o.design_pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenMenuRef(null)}
                            >
                              Download design PDF
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} orders
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium transition-colors ${
                    p === currentPage ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}