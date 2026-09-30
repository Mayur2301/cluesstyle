// PATH: app/api/admin/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/app/lib/admin-auth";
import { listCertificateTemplates, createCertificateTemplate, CERTIFICATE_CATEGORIES, type CertOrientation, type CertCategory, type CertLayer } from "@/app/lib/admin-certificates";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const templates = await listCertificateTemplates();
    return NextResponse.json({ templates });
  } catch (err) {
    console.error("[GET /api/admin/certificates]", err);
    return NextResponse.json({ error: "Could not load certificate templates." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const validCategoryIds = CERTIFICATE_CATEGORIES.map((c) => c.id) as string[];
  const category: CertCategory = validCategoryIds.includes(body.category) ? body.category : "certificate";
  const orientation: CertOrientation = body.orientation === "landscape" ? "landscape" : "portrait";
  const demo_image_url = typeof body.demo_image_url === "string" ? body.demo_image_url : null;
  const blank_image_url = typeof body.blank_image_url === "string" ? body.blank_image_url : null;
  const layers: CertLayer[] = Array.isArray(body.layers) ? body.layers : [];

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  try {
    const template = await createCertificateTemplate({
      name,
      category,
      orientation,
      demo_image_url,
      blank_image_url,
      layers,
      is_active: body.is_active ?? true,
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/certificates]", err);
    return NextResponse.json({ error: "Could not create certificate template." }, { status: 500 });
  }
}