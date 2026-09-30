// PATH: app/admin/(protected)/reports/DonutChart.tsx
// Reusable SVG donut for the Order Status / Payment Methods cards. Pure
// function of `slices` (each a {label, value, colorClass}) — no external
// chart library, same hand-rolled-SVG approach as the rest of the admin
// panel's charts.
export interface DonutSlice {
  label: string;
  value: number;
  colorHex: string;
}

export default function DonutChart({
  title,
  slices,
  centerLabel,
  centerValue,
  emptyText,
}: {
  title: string;
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string;
  emptyText: string;
}) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const size = 160;
  const radius = 58;
  const stroke = 22;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offsetAcc = 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">{title}</h3>
      {total === 0 ? (
        <div className="h-[160px] flex items-center justify-center text-sm text-gray-400">{emptyText}</div>
      ) : (
        <div className="flex items-center gap-5">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
            {/* Only the ring circles are rotated (-90deg around the
                center) so the first slice starts at 12 o'clock — the
                <text> labels below are left alone and drawn upright. */}
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} transform={`rotate(-90 ${cx} ${cy})`} />
            {slices
              .filter((s) => s.value > 0)
              .map((s) => {
                const frac = s.value / total;
                const dash = frac * circumference;
                const dasharray = `${dash} ${circumference - dash}`;
                const dashoffset = -offsetAcc * circumference;
                offsetAcc += frac;
                return (
                  <circle
                    key={s.label}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke={s.colorHex}
                    strokeWidth={stroke}
                    strokeDasharray={dasharray}
                    strokeDashoffset={dashoffset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                  >
                    <title>{`${s.label}: ${s.value} (${Math.round(frac * 100)}%)`}</title>
                  </circle>
                );
              })}
            <text x={cx} y={cy - 3} textAnchor="middle" className="fill-gray-900" fontSize="20" fontWeight="800">
              {centerValue}
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" className="fill-gray-400" fontSize="9">
              {centerLabel}
            </text>
          </svg>
          <div className="space-y-2 min-w-0 flex-1">
            {slices
              .filter((s) => s.value > 0)
              .map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-gray-600 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.colorHex }} />
                    <span className="truncate">{s.label}</span>
                  </span>
                  <span className="font-semibold text-gray-800 whitespace-nowrap">{Math.round((s.value / total) * 100)}%</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}