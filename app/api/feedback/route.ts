import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/lib/db";

// POST /api/feedback
// Body: { type: "page" | "product", page: string, productSlug?: string,
//         rating?: number, message?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const type = body?.type === "product" ? "product" : "page";
    const page = typeof body?.page === "string" ? body.page.slice(0, 500) : "";
    const productSlug = typeof body?.productSlug === "string" ? body.productSlug.slice(0, 255) : null;
    const rating =
      typeof body?.rating === "number" && body.rating >= 1 && body.rating <= 5
        ? Math.round(body.rating)
        : null;
    const message = typeof body?.message === "string" ? body.message.slice(0, 1000) : null;

    if (!page) {
      return NextResponse.json({ error: "Missing page" }, { status: 400 });
    }
    if (rating === null && !message) {
      return NextResponse.json({ error: "Provide a rating or a message" }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO feedback (feedback_type, page, product_slug, rating, message, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, page, productSlug, rating, message, req.headers.get("user-agent") || null]
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[feedback] insert failed:", err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}