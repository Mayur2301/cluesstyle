// PATH: app/admin/(protected)/_components/RevenueChart.tsx
import { formatCurrency, formatDayLabel } from "./format";

export default function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const width = 700;
  const height = 220;
  const padding = { top: 10, bottom: 28, left: 0, right: 0 };
  const chartH = height - padding.top - padding.bottom;
  const barGap = 6;
  const barWidth = (width - barGap * (data.length - 1)) / data.length;

  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">Revenue — last 14 days</h3>
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(total)}</span>
      </div>

      {total === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
          No paid orders in this window yet.
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[220px]" preserveAspectRatio="none">
          {data.map((d, i) => {
            const barH = Math.max((d.revenue / max) * chartH, d.revenue > 0 ? 3 : 0);
            const x = i * (barWidth + barGap);
            const y = padding.top + (chartH - barH);
            return (
              <g key={d.date}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={3}
                  className={d.revenue > 0 ? "fill-gray-900" : "fill-gray-100"}
                >
                  <title>{`${formatDayLabel(d.date)}: ${formatCurrency(d.revenue)}`}</title>
                </rect>
                {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
                  <text
                    x={x + barWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-gray-400"
                    fontSize="10"
                  >
                    {formatDayLabel(d.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}