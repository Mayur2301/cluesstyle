// PATH: app/admin/(protected)/reports/RevenueOrdersChart.tsx
// Bars = revenue (paid orders), line = order count (all orders, any
// payment status) — same day-fill approach as the dashboard's
// RevenueChart, just with a second series overlaid.
import { formatCurrency, formatDayLabel } from "../_components/format";
import type { DayPoint } from "@/app/lib/admin-reports";

export default function RevenueOrdersChart({ data }: { data: DayPoint[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...data.map((d) => d.orders), 1);
  const width = 700;
  const height = 260;
  const padding = { top: 16, bottom: 28, left: 0, right: 0 };
  const chartH = height - padding.top - padding.bottom;
  const barGap = data.length > 20 ? 2 : 6;
  const barWidth = (width - barGap * (data.length - 1)) / data.length;

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);

  const linePoints = data
    .map((d, i) => {
      const x = i * (barWidth + barGap) + barWidth / 2;
      const y = padding.top + (chartH - (d.orders / maxOrders) * chartH);
      return `${x},${y}`;
    })
    .join(" ");

  const labelIdxs = new Set([0, data.length - 1, Math.floor(data.length / 2)]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-gray-900">Revenue &amp; Orders</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-900" /> Revenue ({formatCurrency(totalRevenue)})
          </span>
          <span className="inline-flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Orders ({totalOrders})
          </span>
        </div>
      </div>

      {totalRevenue === 0 && totalOrders === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">No orders in this window yet.</div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[260px]" preserveAspectRatio="none">
          {data.map((d, i) => {
            const barH = Math.max((d.revenue / maxRevenue) * chartH, d.revenue > 0 ? 3 : 0);
            const x = i * (barWidth + barGap);
            const y = padding.top + (chartH - barH);
            return (
              <g key={d.date}>
                <rect x={x} y={y} width={barWidth} height={barH} rx={2} className={d.revenue > 0 ? "fill-gray-900" : "fill-gray-100"}>
                  <title>{`${formatDayLabel(d.date)}: ${formatCurrency(d.revenue)} · ${d.orders} order${d.orders === 1 ? "" : "s"}`}</title>
                </rect>
                {labelIdxs.has(i) && (
                  <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" className="fill-gray-400" fontSize="10">
                    {formatDayLabel(d.date)}
                  </text>
                )}
              </g>
            );
          })}
          <polyline points={linePoints} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => {
            const x = i * (barWidth + barGap) + barWidth / 2;
            const y = padding.top + (chartH - (d.orders / maxOrders) * chartH);
            return (
              <circle key={d.date} cx={x} cy={y} r={2.5} className="fill-blue-500">
                <title>{`${formatDayLabel(d.date)}: ${d.orders} order${d.orders === 1 ? "" : "s"}`}</title>
              </circle>
            );
          })}
        </svg>
      )}
    </div>
  );
}