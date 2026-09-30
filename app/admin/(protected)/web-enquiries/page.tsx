// PATH: app/admin/(protected)/web-enquiries/page.tsx
import Link from "next/link";
import { listWebEnquiries } from "@/app/lib/web-enquiries";
import { formatDateTime } from "../_components/format";
import WebEnquiryStatusControl from "./WebEnquiryStatusControl";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-amber-50 text-amber-700 border-amber-100",
  contacted: "bg-blue-50 text-blue-700 border-blue-100",
  quoted: "bg-purple-50 text-purple-700 border-purple-100",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  "visiting-card": "Visiting Card",
  "identity-card": "Identity Card",
  trophy: "Trophy",
  "executive-kit": "Executive Kit",
  drinkware: "Drinkware",
};

function productTypeLabel(value: string): string {
  if (PRODUCT_TYPE_LABELS[value]) return PRODUCT_TYPE_LABELS[value];
  // Covers the Bulk Order modal's productType values, e.g.
  // "bulk-order-tote_bag" -> "Bulk Order: Tote Bag" — those are free-text
  // product keys from Bulkordermodal.tsx, not in the fixed catalog above.
  if (value.startsWith("bulk-order-")) {
    const rest = value
      .slice("bulk-order-".length)
      .split(/[_-]/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
    return `Bulk Order: ${rest}`;
  }
  return value;
}

export default async function AdminWebEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const enquiries = await listWebEnquiries(type || undefined);

  // Tabs are built from PRODUCT_TYPE_LABELS rather than the live data, so a
  // product type shows up (with a 0 count) even before its first submission.
  const allEnquiries = type ? await listWebEnquiries() : enquiries;
  const counts: Record<string, number> = {};
  for (const e of allEnquiries) counts[e.productType] = (counts[e.productType] || 0) + 1;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Enquiries</h1>
        <p className="text-sm text-gray-500 mt-1">
          "Get a Quote" submissions from the{" "}
          <Link href="/products" target="_blank" className="underline">
            /products
          </Link>{" "}
          catalog's inquiry popups.
        </p>
      </div>

      {/* Product-type filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Link
          href="/admin/web-enquiries"
          className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
            !type ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          All ({allEnquiries.length})
        </Link>
        {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/web-enquiries?type=${value}`}
            className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
              type === value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {label} ({counts[value] || 0})
          </Link>
        ))}
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-sm text-gray-500">
          No enquiries {type ? `for ${productTypeLabel(type)} ` : ""}yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-3">Contact</th>
                <th className="text-left font-medium px-4 py-3">Product</th>
                <th className="text-left font-medium px-4 py-3">Company / Address</th>
                <th className="text-left font-medium px-4 py-3">Details</th>
                <th className="text-left font-medium px-4 py-3">Received</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.map((e) => (
                <tr key={e.id} className="align-top">
                  <td className="px-4 py-4 min-w-[180px]">
                    <p className="font-medium text-gray-900">{e.fullName}</p>
                    <a href={`mailto:${e.email}`} className="text-xs text-gray-500 hover:underline block">
                      {e.email}
                    </a>
                    <a href={`tel:${e.phone}`} className="text-xs text-gray-400 hover:underline block">
                      {e.phone}
                    </a>
                  </td>
                  <td className="px-4 py-4 min-w-[130px]">
                    <span className="inline-flex text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 rounded-full px-2.5 py-1">
                      {productTypeLabel(e.productType)}
                    </span>
                  </td>
                  <td className="px-4 py-4 min-w-[180px]">
                    {e.companyName && <p className="text-xs text-gray-700">{e.companyName}</p>}
                    {e.businessAddress && <p className="text-xs text-gray-400 mt-0.5">{e.businessAddress}</p>}
                  </td>
                  <td className="px-4 py-4 min-w-[220px] max-w-sm">
                    {Object.keys(e.details).length === 0 ? (
                      <span className="text-xs text-gray-300">—</span>
                    ) : (
                      <ul className="space-y-0.5">
                        {Object.entries(e.details).map(([key, value]) => (
                          <li key={key} className="text-xs text-gray-600">
                            <span className="text-gray-400">{key.replace(/_/g, " ")}:</span>{" "}
                            {String(value)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {formatDateTime(e.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex text-xs font-medium border rounded-full px-2.5 py-1 mb-2 ${
                        STATUS_STYLES[e.status] || "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {e.status}
                    </span>
                    <WebEnquiryStatusControl id={e.id} currentStatus={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}