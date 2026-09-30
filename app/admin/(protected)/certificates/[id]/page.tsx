// PATH: app/admin/(protected)/certificates/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCertificateTemplateById } from "@/app/lib/admin-certificates";
import CertificateBuilder from "../CertificateBuilder";

export default async function EditCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const template = await getCertificateTemplateById(id);
  if (!template) notFound();

  return (
    <div className="space-y-4">
      <Link href="/admin/certificates" className="text-xs text-gray-400 hover:text-gray-700">
        ← Back to certificates
      </Link>

      <CertificateBuilder
        mode="edit"
        templateId={template.id}
        initial={{
          name: template.name,
          category: template.category,
          orientation: template.orientation,
          demo_image_url: template.demo_image_url,
          blank_image_url: template.blank_image_url,
          layers: template.layers,
          is_active: template.is_active,
        }}
      />
    </div>
  );
}