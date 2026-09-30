// PATH: app/admin/(protected)/heatmap/HeatmapFilterBar.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function HeatmapFilterBar({
  pages,
  initialPage,
  initialFrom,
  initialTo,
}: {
  pages: string[];
  initialPage: string;
  initialFrom: string;
  initialTo: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasDateFilter = !!(initialFrom || initialTo);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-wrap items-center gap-2.5">
      <select
        value={initialPage}
        onChange={(e) => pushParams({ page: e.target.value })}
        disabled={pages.length === 0}
        className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-600 outline-none focus:border-gray-400 min-w-[200px] max-w-full disabled:opacity-50"
      >
        {pages.length === 0 && <option value="">No pages tracked yet</option>}
        {pages.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1.5">
        <label className="text-xs text-gray-400">From</label>
        <input
          type="date"
          defaultValue={initialFrom}
          onChange={(e) => pushParams({ from: e.target.value })}
          className="h-9 rounded-lg border border-gray-200 px-2.5 text-sm outline-none focus:border-gray-400"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-gray-400">To</label>
        <input
          type="date"
          defaultValue={initialTo}
          onChange={(e) => pushParams({ to: e.target.value })}
          className="h-9 rounded-lg border border-gray-200 px-2.5 text-sm outline-none focus:border-gray-400"
        />
      </div>

      {hasDateFilter && (
        <button
          onClick={() => pushParams({ from: "", to: "" })}
          className="h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50"
        >
          Clear Dates
        </button>
      )}
    </div>
  );
}