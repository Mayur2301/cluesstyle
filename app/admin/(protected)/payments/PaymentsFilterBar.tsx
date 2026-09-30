// PATH: app/admin/(protected)/payments/PaymentsFilterBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const METHOD_OPTIONS = [
  { value: "", label: "All Methods" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "netbanking", label: "Netbanking" },
  { value: "wallet", label: "Wallet" },
  { value: "emi", label: "EMI" },
];
const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];
const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "standard", label: "Standard" },
  { value: "sameday", label: "Same Day" },
  { value: "pickup", label: "Self Pickup" },
];

export default function PaymentsFilterBar({
  initialQ,
  initialMethod,
  initialStatus,
  initialType,
}: {
  initialQ: string;
  initialMethod: string;
  initialStatus: string;
  initialType: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page");
    params.delete("details");
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (q === initialQ) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ q }), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasActiveFilters = !!(initialQ || initialMethod || initialStatus || initialType);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-wrap items-center gap-2.5">
      <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by Order ID, customer, payment ID..."
          className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
        />
      </div>

      <select defaultValue={initialMethod} onChange={(e) => pushParams({ method: e.target.value })} className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-600 outline-none focus:border-gray-400">
        {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select defaultValue={initialStatus} onChange={(e) => pushParams({ status: e.target.value })} className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-600 outline-none focus:border-gray-400">
        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select defaultValue={initialType} onChange={(e) => pushParams({ type: e.target.value })} className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-600 outline-none focus:border-gray-400">
        {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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