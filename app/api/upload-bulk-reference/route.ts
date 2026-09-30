// PATH: app/api/upload-bulk-reference/route.ts
//
// Reference-image/PDF upload for the Bulk Order modal's "Upload Reference"
// step (app/components/Bulkordermodal.tsx). Mirrors the same
// read-formData → write-to-public/uploads → return URL pattern already used
// by app/api/upload-logo/route.ts, just without that route's "side"
// (front/back/left/right) requirement, which doesn't apply here.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Only PNG, JPEG, WebP, or PDF files are supported." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "bulk-order-references");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), bytes);

    return NextResponse.json({ url: `/uploads/bulk-order-references/${fileName}` });
  } catch (err: any) {
    console.error("[upload-bulk-reference]", err);
    return NextResponse.json({ error: "Could not upload file." }, { status: 500 });
  }
}