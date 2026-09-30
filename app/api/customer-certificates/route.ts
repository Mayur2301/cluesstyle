// PATH: app/api/customer-certificates/route.ts
//
// Saves a logged-in customer's edits to an admin-authored certificate
// template. Verifies the same JWT your storefront already sends as
// `Authorization: Bearer <token>` — signed the same way as
// app/api/auth/login/route.ts and app/api/auth/register/route.ts
// (jsonwebtoken + process.env.JWT_SECRET, payload has `userId`).

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { saveCustomerCertificate } from "@/app/lib/customer-certificates";
import { getCertificateTemplateById } from "@/app/lib/admin-certificates";

interface AuthTokenPayload {
  userId: number;
  email: string;
  userType: string;
  name: string;
}

function getUserIdFromRequest(req: NextRequest): number | null {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload;
    return payload.userId ?? null;
  } catch {
    return null; // missing/expired/tampered token
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Please sign in to save your certificate design." },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const templateId = Number(body.templateId);
  const edits = body.edits && typeof body.edits === "object" ? body.edits : {};
  const certificateScale = Number(body.certificateScale) || 1;

  if (!templateId) {
    return NextResponse.json({ error: "templateId is required." }, { status: 400 });
  }

  // Confirm the template is real and currently active before accepting edits
  // against it — also guards against saving edits keyed to a layer id that
  // was never marked editableByCustomer.
  const template = await getCertificateTemplateById(templateId);
  if (!template || !template.is_active) {
    return NextResponse.json({ error: "This certificate template is no longer available." }, { status: 404 });
  }
  const editableLayerIds = new Set(
    template.layers.filter((l) => "editableByCustomer" in l && l.editableByCustomer).map((l) => l.id)
  );
  const sanitizedEdits: Record<string, { text?: string; imageSrc?: string }> = {};
  for (const [layerId, value] of Object.entries(edits)) {
    if (editableLayerIds.has(layerId) && value && typeof value === "object") {
      sanitizedEdits[layerId] = value as { text?: string; imageSrc?: string };
    }
  }

  try {
    const saved = await saveCustomerCertificate({
      userId,
      templateId,
      edits: sanitizedEdits,
      certificateScale,
    });
    return NextResponse.json({ customerCertificate: saved }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/customer-certificates]", err);
    return NextResponse.json({ error: "Could not save your certificate. Please try again." }, { status: 500 });
  }
}