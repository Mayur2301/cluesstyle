// PATH: app/admin/(protected)/reports/ReportStatCard.tsx
function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
      <svg className={`w-3 h-3 ${up ? "" : "rotate-180"}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 11-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
      </svg>
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

export default function ReportStatCard({
  label,
  value,
  changePct,
  iconBg,
  iconText,
  icon,
}: {
  label: string;
  value: string;
  changePct: number | null;
  iconBg: string;
  iconText: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} ${iconText}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      <div className="flex items-center gap-1.5 mt-1">
        <ChangeBadge pct={changePct} />
        <span className="text-xs text-gray-400">vs last period</span>
      </div>
    </div>
  );
}