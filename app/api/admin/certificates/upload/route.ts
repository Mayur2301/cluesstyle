// PATH: app/api/admin/certificates/upload/route.ts
//
// Lets the admin upload an actual image file (demo or blank certificate
// photo) instead of typing a path. Saves it under public/certificates/ and
// returns the URL to store on the template.
//
// ⚠️ ASSUMPTION TO FLAG: this writes directly to the local filesystem
// (public/certificates/), which only works if your app runs on a
// persistent server (a VPS, a Node process that stays alive) — it will
// NOT work on serverless hosting like Vercel, where the filesystem is
// read-only/ephemeral at runtime. Given you're on MySQL + a traditional
// server setup elsewhere in this project, that's the assumption here — if
// you're actually on serverless, tell me and I'll switch this to
// S3/Cloudinary/whatever object storage you use instead.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/app/lib/admin-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "certificates");
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeBaseName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "certificate";
}

function extFromType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WEBP images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 8MB)." }, { status: 400 });
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = extFromType(file.type);
    const base = sanitizeBaseName(file.name);
    const filename = `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/certificates/${filename}` }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/certificates/upload]", err);
    return NextResponse.json({ error: "Could not save the uploaded image." }, { status: 500 });
  }
}