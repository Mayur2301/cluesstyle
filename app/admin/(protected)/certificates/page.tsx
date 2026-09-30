// PATH: app/admin/(protected)/certificates/page.tsx
import Link from "next/link";
import { listCertificateTemplates, CERTIFICATE_CATEGORIES, type CertCategory } from "@/app/lib/admin-certificates";
import CertificateThumbnail from "./CertificateThumbnail";
import DeleteCertificateButton from "./DeleteCertificateButton";

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const validCategoryIds = CERTIFICATE_CATEGORIES.map((c) => c.id) as string[];
  const activeCategory: CertCategory | "all" = validCategoryIds.includes(categoryParam ?? "")
    ? (categoryParam as CertCategory)
    : "all";

  const allTemplates = await listCertificateTemplates();
  const templates = activeCategory === "all" ? allTemplates : allTemplates.filter((t) => t.category === activeCategory);

  const categoryLabel = (id: CertCategory) => CERTIFICATE_CATEGORIES.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Certificates</h1>
          <p className="text-sm text-gray-500">
            Design certificate/style layouts here — active ones become the starting templates customers can pick
            from on that product's page. Each product only ever sees templates in its own category.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/certificates/new?orientation=portrait${activeCategory !== "all" ? `&category=${activeCategory}` : ""}`}
            className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2.5 transition-colors"
          >
            + New certificate
          </Link>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/admin/certificates"
          className={`text-xs font-semibold rounded-full px-3 py-1.5 transition-colors ${
            activeCategory === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        {CERTIFICATE_CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/admin/certificates?category=${c.id}`}
            className={`text-xs font-semibold rounded-full px-3 py-1.5 transition-colors ${
              activeCategory === c.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-16 text-center">
          <p className="text-sm text-gray-400 mb-4">
            No {activeCategory === "all" ? "" : `${categoryLabel(activeCategory)} `}certificate templates yet.
          </p>
          <Link
            href={`/admin/certificates/new?orientation=portrait${activeCategory !== "all" ? `&category=${activeCategory}` : ""}`}
            className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2.5 transition-colors"
          >
            Create your first certificate
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
              <Link href={`/admin/certificates/${t.id}`} className="block">
                <CertificateThumbnail
                  orientation={t.orientation}
                  demoImageUrl={t.demo_image_url}
                />
              </Link>

              <div className="p-3.5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 truncate">{t.name}</span>
                  {!t.is_active && (
                    <span className="flex-shrink-0 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">
                    {categoryLabel(t.category)}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{t.orientation}</span>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <Link
                    href={`/admin/certificates/${t.id}`}
                    className="flex-1 text-center text-xs font-semibold border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg py-2 transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteCertificateButton id={t.id} name={t.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}