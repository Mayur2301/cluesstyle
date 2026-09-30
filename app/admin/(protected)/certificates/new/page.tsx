// PATH: app/admin/(protected)/certificates/new/page.tsx
import Link from "next/link";
import CertificateBuilder from "../CertificateBuilder";
import { CERTIFICATE_CATEGORIES, type CertOrientation, type CertCategory } from "@/app/lib/admin-certificates";

export default async function NewCertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ orientation?: string; category?: string }>;
}) {
  const { orientation: orientationParam, category: categoryParam } = await searchParams;
  const orientation: CertOrientation = orientationParam === "landscape" ? "landscape" : "portrait";
  const validCategoryIds = CERTIFICATE_CATEGORIES.map((c) => c.id) as string[];
  const category: CertCategory = validCategoryIds.includes(categoryParam ?? "") ? (categoryParam as CertCategory) : "certificate";

  return (
    <div className="space-y-4">
      <Link href="/admin/certificates" className="text-xs text-gray-400 hover:text-gray-700">
        ← Back to certificates
      </Link>

      <CertificateBuilder
        mode="new"
        initial={{
          name: "",
          category,
          orientation,
          demo_image_url: null,
          blank_image_url: null,
          layers: [],
          is_active: true,
        }}
      />
    </div>
  );
}