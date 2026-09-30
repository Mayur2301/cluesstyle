// PATH: app/admin/(protected)/reports/ReportsTabs.tsx
import Link from "next/link";

const TABS: { key: string; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "products", label: "Products" },
  { key: "payments", label: "Payments" },
  { key: "shipping", label: "Shipping" },
  { key: "marketing", label: "Marketing" },
];

export default function ReportsTabs({ active, baseQs }: { active: string; baseQs: string }) {
  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <nav className="flex items-center gap-6 min-w-max">
        {TABS.map((t) => {
          const isActive = active === t.key;
          const href = `?${baseQs ? `${baseQs}&` : ""}tab=${t.key}`;
          return (
            <Link
              key={t.key}
              href={href}
              className={`relative py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
              {isActive && <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-blue-600" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}