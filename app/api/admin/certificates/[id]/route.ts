// PATH: app/api/admin/certificates/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/app/lib/admin-auth";
import {
  getCertificateTemplateById,
  updateCertificateTemplate,
  deleteCertificateTemplate,
  CERTIFICATE_CATEGORIES,
  type CertOrientation,
  type CertCategory,
  type CertLayer,
} from "@/app/lib/admin-certificates";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;
  return session;
}

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    const template = await getCertificateTemplateById(id);
    if (!template) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ template });
  } catch (err) {
    console.error("[GET /api/admin/certificates/:id]", err);
    return NextResponse.json({ error: "Could not load certificate template." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const patch: {
    name?: string;
    category?: CertCategory;
    orientation?: CertOrientation;
    demo_image_url?: string | null;
    blank_image_url?: string | null;
    layers?: CertLayer[];
    is_active?: boolean;
  } = {};

  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  const validCategoryIds = CERTIFICATE_CATEGORIES.map((c) => c.id) as string[];
  if (validCategoryIds.includes(body.category)) patch.category = body.category;
  if (body.orientation === "portrait" || body.orientation === "landscape") patch.orientation = body.orientation;
  if (body.demo_image_url === null || typeof body.demo_image_url === "string") {
    patch.demo_image_url = body.demo_image_url;
  }
  if (body.blank_image_url === null || typeof body.blank_image_url === "string") {
    patch.blank_image_url = body.blank_image_url;
  }
  if (Array.isArray(body.layers)) patch.layers = body.layers;
  if (typeof body.is_active === "boolean") patch.is_active = body.is_active;

  try {
    const template = await updateCertificateTemplate(id, patch);
    if (!template) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ template });
  } catch (err) {
    console.error("[PATCH /api/admin/certificates/:id]", err);
    return NextResponse.json({ error: "Could not update certificate template." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    const ok = await deleteCertificateTemplate(id);
    if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/certificates/:id]", err);
    return NextResponse.json({ error: "Could not delete certificate template." }, { status: 500 });
  }
}