// PATH: app/admin/(protected)/_components/MiniStatRow.tsx
function CartIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.766-4.83 1.766-7.5H5.106M7.5 14.25L5.106 5.272M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
function XCircleIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

interface Item {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconText: string;
  trend?: string | null;
}

export default function MiniStatRow({
  totalOrders,
  ordersToday,
  ordersYesterday,
  processing,
  shipped,
  delivered,
  cancelled,
}: {
  totalOrders: number;
  ordersToday: number;
  ordersYesterday: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}) {
  const trend =
    ordersYesterday > 0
      ? `${ordersToday >= ordersYesterday ? "+" : ""}${Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100)}%`
      : ordersToday > 0
        ? "New today"
        : null;

  const items: Item[] = [
    { label: "Total Orders", value: totalOrders, icon: <CartIcon />, iconBg: "bg-gray-900", iconText: "text-white", trend },
    { label: "Processing", value: processing, icon: <ClockIcon />, iconBg: "bg-amber-100", iconText: "text-amber-600" },
    { label: "Shipped", value: shipped, icon: <TruckIcon />, iconBg: "bg-blue-100", iconText: "text-blue-600" },
    { label: "Delivered", value: delivered, icon: <CheckCircleIcon />, iconBg: "bg-green-100", iconText: "text-green-600" },
    { label: "Cancelled", value: cancelled, icon: <XCircleIcon />, iconBg: "bg-red-100", iconText: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((it) => (
        <div key={it.label} className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${it.iconBg} ${it.iconText}`}>
              {it.icon}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-gray-900 leading-tight">
                {it.value}
                {it.trend && (
                  <span className="ml-1.5 align-middle text-[10px] font-bold text-green-600 bg-green-50 rounded-full px-1.5 py-0.5">
                    {it.trend}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 leading-tight truncate">{it.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}