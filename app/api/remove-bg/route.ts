// app/api/remove-bg/route.ts
//
// Proxies image uploads from the browser to the Python rembg microservice
// (rembg_service.py) and streams the transparent-background PNG back.
//
// Set REMBG_SERVICE_URL and REMBG_API_KEY in your .env — e.g.
//   REMBG_SERVICE_URL=https://bgremove.cluesstyle.com   (prod)
//   REMBG_SERVICE_URL=http://localhost:7860             (dev, if running locally)
//   REMBG_API_KEY=<same value the Python service's REMBG_API_KEY is set to>

import { NextRequest, NextResponse } from "next/server";

const REMBG_SERVICE_URL = process.env.REMBG_SERVICE_URL || "http://localhost:7860";
const REMBG_API_KEY = process.env.REMBG_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!REMBG_API_KEY) {
      // Fail loudly in dev/misconfigured deploys rather than silently
      // sending an unauthenticated request that the Python side will 401.
      throw new Error("REMBG_API_KEY is not set in this environment");
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const forwardForm = new FormData();
    forwardForm.append("file", file, (file as File).name ?? "upload.png");

    const upstream = await fetch(`${REMBG_SERVICE_URL}/remove-bg`, {
      method: "POST",
      headers: { "X-API-Key": REMBG_API_KEY },
      body: forwardForm,
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: "Background removal failed", detail },
        { status: upstream.status }
      );
    }

    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error removing background" },
      { status: 500 }
    );
  }
}