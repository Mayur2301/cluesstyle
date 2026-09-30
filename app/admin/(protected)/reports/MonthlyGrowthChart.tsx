// PATH: app/admin/(protected)/reports/MonthlyGrowthChart.tsx
import { formatCurrency } from "../_components/format";
import type { MonthPoint } from "@/app/lib/admin-reports";

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short" });
}

export default function MonthlyGrowthChart({ data }: { data: MonthPoint[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...data.map((d) => d.orders), 1);
  const width = 700;
  const height = 220;
  const padding = { top: 14, bottom: 24, left: 0, right: 0 };
  const chartH = height - padding.top - padding.bottom;
  const groupGap = 28;
  const groupWidth = (width - groupGap * (data.length - 1)) / data.length;
  const barGap = 4;
  const barWidth = (groupWidth - barGap) / 2;

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">Monthly Growth</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Revenue
          </span>
          <span className="inline-flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Orders
          </span>
        </div>
      </div>

      {totalRevenue === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No paid orders in this window yet.</div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[220px]" preserveAspectRatio="none">
          {data.map((d, i) => {
            const groupX = i * (groupWidth + groupGap);
            const revH = Math.max((d.revenue / maxRevenue) * chartH, d.revenue > 0 ? 3 : 0);
            const ordH = Math.max((d.orders / maxOrders) * chartH, d.orders > 0 ? 3 : 0);
            return (
              <g key={d.month}>
                <rect x={groupX} y={padding.top + (chartH - revH)} width={barWidth} height={revH} rx={2} className={d.revenue > 0 ? "fill-blue-500" : "fill-gray-100"}>
                  <title>{`${monthLabel(d.month)}: ${formatCurrency(d.revenue)}`}</title>
                </rect>
                <rect x={groupX + barWidth + barGap} y={padding.top + (chartH - ordH)} width={barWidth} height={ordH} rx={2} className={d.orders > 0 ? "fill-purple-300" : "fill-gray-100"}>
                  <title>{`${monthLabel(d.month)}: ${d.orders} order${d.orders === 1 ? "" : "s"}`}</title>
                </rect>
                <text x={groupX + groupWidth / 2} y={height - 6} textAnchor="middle" className="fill-gray-400" fontSize="10">
                  {monthLabel(d.month)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}