// PATH: app/admin/(protected)/heatmap/page.tsx
import Link from "next/link";
import {
  parseHeatmapFilters,
  heatmapFiltersToQueryString,
  getTrackedPages,
  getClickPoints,
  getTopElements,
  getHeatmapTotals,
} from "@/app/lib/admin-heatmap";
import { formatDateTime } from "../_components/format";
import HeatmapCanvas from "./HeatmapCanvas";
import HeatmapFilterBar from "./HeatmapFilterBar";

function StatCard({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className={`text-lg font-bold text-gray-900 mt-1.5 ${truncate ? "truncate" : ""}`} title={truncate ? value : undefined}>
        {value}
      </p>
    </div>
  );
}

export default async function HeatmapPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const filters = parseHeatmapFilters(sp);

  const [pages, totals] = await Promise.all([getTrackedPages(filters), getHeatmapTotals(filters)]);

  // Default to the busiest page if none is explicitly selected.
  const selectedPage = filters.page && pages.some((p) => p.page === filters.page) ? filters.page : pages[0]?.page ?? null;

  const [points, topElements] = selectedPage
    ? await Promise.all([getClickPoints(selectedPage, filters), getTopElements(selectedPage, filters)])
    : [[], []];

  const heatPoints = points.map((p) => ({
    xPct: Math.min(1, Math.max(0, p.x / (p.viewport_width as number))),
    yPct: Math.min(1, Math.max(0, p.y / (p.viewport_height as number))),
  }));

  const selectedSummary = pages.find((p) => p.page === selectedPage);
  const unpositionedCount = (selectedSummary?.clicks ?? 0) - points.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Click Heatmap</h1>
        <p className="text-sm text-gray-500">Where visitors click on your storefront pages, built from live click tracking.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Clicks" value={totals.totalClicks.toLocaleString("en-IN")} />
        <StatCard label="Pages Tracked" value={totals.totalPages.toLocaleString("en-IN")} />
        <StatCard label="Most Clicked Page" value={totals.topPage ?? "—"} truncate />
      </div>

      <HeatmapFilterBar
        pages={pages.map((p) => p.page)}
        initialPage={selectedPage ?? ""}
        initialFrom={filters.from ?? ""}
        initialTo={filters.to ?? ""}
      />

      {!selectedPage ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          No click data has been recorded yet. Once visitors start clicking around your storefront, this page fills in
          automatically — nothing else to set up.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="mb-3">
              <p className="text-sm font-bold text-gray-900 truncate" title={selectedPage}>
                {selectedPage}
              </p>
              <p className="text-xs text-gray-400">
                {heatPoints.length.toLocaleString("en-IN")} positioned click{heatPoints.length === 1 ? "" : "s"} shown
                {unpositionedCount > 0
                  ? ` (+ ${unpositionedCount.toLocaleString("en-IN")} without a recorded screen size, counted below but not plotted)`
                  : ""}
              </p>
            </div>

            {heatPoints.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">No positioned clicks for this page/date range yet.</div>
            ) : (
              <>
                <HeatmapCanvas points={heatPoints} />
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                  Dots are click positions normalized to each visitor's own screen size (0–100% of viewport width/height) — this
                  isn't overlaid on a screenshot of the actual page, so treat clusters as relative hotspots (e.g. top nav vs.
                  footer vs. mid-page) rather than pixel-exact coordinates.
                </p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-bold text-gray-900 mb-3">Top Clicked Elements</p>
            {topElements.length === 0 ? (
              <p className="text-sm text-gray-400">No clicks recorded for this page yet.</p>
            ) : (
              <div className="space-y-2.5">
                {topElements.map((el, i) => (
                  <div key={`${el.href ?? "nohref"}-${i}`} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-gray-800 truncate">{el.click_text || "(no text)"}</p>
                      <p className="text-xs text-gray-400 truncate">{el.href || "(no href)"}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-1 flex-shrink-0">
                      {el.clicks.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">All Tracked Pages</p>
        </div>
        {pages.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">No click data yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-2.5 font-medium">Page</th>
                  <th className="px-5 py-2.5 font-medium">Clicks</th>
                  <th className="px-5 py-2.5 font-medium">Last Click</th>
                  <th className="px-5 py-2.5 font-medium text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pages.map((p) => (
                  <tr key={p.page} className={`hover:bg-gray-50/60 ${p.page === selectedPage ? "bg-blue-50/40" : ""}`}>
                    <td className="px-5 py-3 text-gray-700 truncate max-w-[320px]" title={p.page}>
                      {p.page}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{p.clicks.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDateTime(p.last_click)}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`?${heatmapFiltersToQueryString({ ...filters, page: p.page })}`}
                        className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 whitespace-nowrap ${
                          p.page === selectedPage
                            ? "text-blue-700 bg-blue-100 border border-blue-200"
                            : "text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100"
                        }`}
                      >
                        View Heatmap
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}