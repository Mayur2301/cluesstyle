// PATH: app/admin/(protected)/reports/ReportsActions.tsx
// Every button here is a real CSV download from /api/admin/reports/export
// (see that route) — filtered to the currently selected date range.
function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

export default function ReportsActions({ rangeQs }: { rangeQs: string }) {
  const items = [
    { type: "sales", label: "Download Sales Report" },
    { type: "orders", label: "Download Order Report" },
    { type: "customers", label: "Download Customer Report" },
    { type: "payments", label: "Download Payment Report" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Reports Actions</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <a
            key={item.type}
            href={`/api/admin/reports/export?type=${item.type}&${rangeQs}`}
            className="flex items-center gap-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl px-3.5 py-2.5 hover:bg-gray-50"
          >
            <DownloadIcon />
            {item.label}
          </a>
        ))}
        <a
          href={`/api/admin/reports/export?type=sales&${rangeQs}`}
          className="flex items-center gap-2.5 text-sm font-medium text-blue-700 border border-blue-100 bg-blue-50 rounded-xl px-3.5 py-2.5 hover:bg-blue-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Custom Report (Date Range)
        </a>
      </div>
    </div>
  );
}