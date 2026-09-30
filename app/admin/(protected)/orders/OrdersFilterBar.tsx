// PATH: app/admin/(protected)/orders/OrdersFilterBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];
const DELIVERY_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "standard", label: "Standard" },
  { value: "sameday", label: "Same Day" },
  { value: "pickup", label: "Self Pickup" },
];
const PAYMENT_OPTIONS = [
  { value: "", label: "All Payments" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export default function OrdersFilterBar({
  initialQ,
  initialDelivery,
  initialStatus,
  initialPayment,
  initialFrom,
  initialTo,
}: {
  initialQ: string;
  initialDelivery: string;
  initialStatus: string;
  initialPayment: string;
  initialFrom: string;
  initialTo: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [dateOpen, setDateOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page"); // any filter change resets to page 1
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounced search — waits for the shopper... err, admin to stop typing.
  useEffect(() => {
    if (q === initialQ) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ q }), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasActiveFilters = !!(initialQ || initialDelivery || initialStatus || initialPayment || initialFrom || initialTo);

  const dateLabel =
    from && to ? `${from} → ${to}` : from ? `From ${from}` : to ? `Until ${to}` : "Select date range";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-wrap items-center gap-2.5">
      <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by Order ID, customer, product..."
          className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
        />
      </div>

      {/* Date range */}
      <div className="relative">
        <button
          onClick={() => setDateOpen((v) => !v)}
          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 flex items-center gap-2 hover:border-gray-300 whitespace-nowrap"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          {dateLabel}
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {dateOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDateOpen(false)} />
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-gray-100 shadow-lg z-20 p-3.5 space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full h-9 mt-1 rounded-lg border border-gray-200 px-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full h-9 mt-1 rounded-lg border border-gray-200 px-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => { setFrom(""); setTo(""); pushParams({ from: "", to: "" }); setDateOpen(false); }}
                  className="text-xs font-medium text-gray-500 hover:text-gray-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => { pushParams({ from, to }); setDateOpen(false); }}
                  className="text-xs font-semibold bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <select
        defaultValue={initialDelivery}
        onChange={(e) => pushParams({ delivery: e.target.value })}
        className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-600 outline-none focus:border-gray-400"
      >
        {DELIVERY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        defaultValue={initialStatus}
        onChange={(e) => pushParams({ status: e.target.value })}
        className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-600 outline-none focus:border-gray-400"
      >
        {ORDER_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        defaultValue={initialPayment}
        onChange={(e) => pushParams({ payment: e.target.value })}
        className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-600 outline-none focus:border-gray-400"
      >
        {PAYMENT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <button
        onClick={() => router.push(pathname)}
        disabled={!hasActiveFilters}
        className="h-9 px-3.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        Reset
      </button>
    </div>
  );
}