// PATH: app/admin/(protected)/certificates/CertificateThumbnail.tsx
// List-page preview card — just the admin's uploaded demo photo (the
// fully-filled-in example), same image customers see when browsing
// templates. No more CSS layer approximation now that real photos exist.

import type { CertOrientation } from "@/app/lib/admin-certificates";

export default function CertificateThumbnail({
  orientation,
  demoImageUrl,
}: {
  orientation: CertOrientation;
  demoImageUrl: string | null;
}) {
  return (
    <div
      className="relative w-full overflow-hidden border-b border-gray-100 bg-gray-50"
      style={{ aspectRatio: orientation === "portrait" ? "3 / 4" : "4 / 3" }}
    >
      {demoImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={demoImageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-gray-300 text-center px-3">
          No demo image yet
        </div>
      )}
    </div>
  );
}