// PATH: app/admin/(protected)/payments/PaymentsDateRangeButton.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function formatLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function PaymentsDateRangeButton({ initialFrom, initialTo }: { initialFrom: string; initialTo: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  const label = initialFrom && initialTo ? `${formatLabel(initialFrom)} - ${formatLabel(initialTo)}` : initialFrom ? `From ${formatLabel(initialFrom)}` : initialTo ? `Until ${formatLabel(initialTo)}` : "All time";

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set("from", from); else params.delete("from");
    if (to) params.set("to", to); else params.delete("to");
    params.delete("page");
    params.delete("details");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl px-3.5 py-2 hover:bg-gray-50 whitespace-nowrap"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        {label}
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-100 shadow-lg z-20 p-3.5 space-y-2.5">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">From</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full h-9 mt-1 rounded-lg border border-gray-200 px-2.5 text-sm outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">To</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full h-9 mt-1 rounded-lg border border-gray-200 px-2.5 text-sm outline-none focus:border-gray-400" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button onClick={() => { setFrom(""); setTo(""); }} className="text-xs font-medium text-gray-500 hover:text-gray-800">
                Clear
              </button>
              <button onClick={apply} className="text-xs font-semibold bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-800">
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}