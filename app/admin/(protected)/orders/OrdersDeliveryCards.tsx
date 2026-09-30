// PATH: app/admin/(protected)/orders/OrdersDeliveryCards.tsx
import Link from "next/link";

function TruckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}
function StoreIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
    </svg>
  );
}

export default function OrdersDeliveryCards({
  standard,
  sameday,
  pickup,
  active,
  queryStringWithout, // querystring (no leading "?", no `delivery`/`page` keys) to preserve other filters when switching
}: {
  standard: number;
  sameday: number;
  pickup: number;
  active: "standard" | "sameday" | "pickup" | null;
  queryStringWithout: string;
}) {
  const cards = [
    { key: "standard" as const, label: "Standard Delivery", count: standard, icon: <TruckIcon />, iconBg: "bg-blue-100 text-blue-600", isDefault: true },
    { key: "sameday" as const, label: "Same Day Delivery", count: sameday, icon: <BoltIcon />, iconBg: "bg-amber-100 text-amber-600", isDefault: false },
    { key: "pickup" as const, label: "Self Pickup", count: pickup, icon: <StoreIcon />, iconBg: "bg-green-100 text-green-600", isDefault: false },
  ];

  const hrefFor = (key: "standard" | "sameday" | "pickup") => {
    const isActive = active === key;
    const base = queryStringWithout ? `${queryStringWithout}&` : "";
    return isActive ? `?${queryStringWithout}` : `?${base}delivery=${key}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c) => {
        const isActive = active === c.key;
        return (
          <Link
            key={c.key}
            href={hrefFor(c.key)}
            className={`relative flex items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
              isActive ? "border-blue-400 bg-blue-50/40 ring-1 ring-blue-400" : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <span
              className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                isActive ? "border-blue-600" : "border-gray-300"
              }`}
            >
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </span>
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>{c.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{c.label}</p>
              <p className="text-xl font-extrabold text-gray-900 leading-tight">{c.count.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-gray-400 leading-tight">Orders</p>
            </div>
            {c.isDefault && (
              <span className="absolute bottom-3 right-3 text-[10px] font-bold text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">
                Default
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}