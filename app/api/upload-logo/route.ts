// PATH: app/api/upload-logo/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const VALID_SIDES = ["front", "back", "left", "right"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const side = formData.get("side");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (typeof side !== "string" || !VALID_SIDES.includes(side)) {
      return NextResponse.json({ error: "Invalid or missing side." }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Only PNG, JPEG, or WebP logo files are supported." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Logo file must be under 10MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "logos");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), bytes);

    return NextResponse.json({ url: `/uploads/logos/${fileName}` });
  } catch (err: any) {
    console.error("[upload-logo]", err);
    return NextResponse.json({ error: "Could not upload logo." }, { status: 500 });
  }
}