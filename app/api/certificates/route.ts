// PATH: app/api/certificates/route.ts
//
// Public, unauthenticated endpoint — each product page calls this to offer
// admin-authored templates as starting layouts. Only ever returns templates
// with is_active = true (see listActiveCertificateTemplates). No admin
// session required.
//
// `category` is required — it's what keeps different products' template
// libraries separate (e.g. Certificate Frames only ever sees "certificate"
// templates, Home Decor only ever sees "home-decor" ones). Defaults to
// "certificate" if omitted, for backwards compatibility with any existing
// callers that don't pass it yet.
//
// Usage from the storefront: GET /api/certificates?category=home-decor
//                             GET /api/certificates?category=home-decor&orientation=portrait

import { NextRequest, NextResponse } from "next/server";
import { listActiveCertificateTemplates, CERTIFICATE_CATEGORIES, type CertOrientation, type CertCategory } from "@/app/lib/admin-certificates";

export async function GET(req: NextRequest) {
  const categoryParam = req.nextUrl.searchParams.get("category");
  const validCategoryIds = CERTIFICATE_CATEGORIES.map((c) => c.id) as string[];
  const category: CertCategory = validCategoryIds.includes(categoryParam ?? "") ? (categoryParam as CertCategory) : "certificate";

  const orientationParam = req.nextUrl.searchParams.get("orientation");
  const orientation: CertOrientation | undefined =
    orientationParam === "portrait" || orientationParam === "landscape" ? orientationParam : undefined;

  try {
    const templates = await listActiveCertificateTemplates(category, orientation);
    return NextResponse.json({ templates });
  } catch (err) {
    console.error("[GET /api/certificates]", err);
    return NextResponse.json({ error: "Could not load certificates." }, { status: 500 });
  }
}