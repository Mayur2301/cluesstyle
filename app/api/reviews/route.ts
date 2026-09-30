import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import pool from "@/app/lib/db";

// ── Types ──────────────────────────────────────────────────────────────────

interface ReviewMediaRow {
  media_type: "image" | "video";
  url: string;
}

interface ReviewRow {
  id: number;
  user_name: string;
  rating: number;
  review_text: string | null;
  verified: number;
  created_at: string;
}

// ── Auth helper ────────────────────────────────────────────────────────────
// Same JWT shape your /api/auth/login and /api/auth/register routes already
// sign: { userId, email, userType, name }.

function getUserFromRequest(req: NextRequest): { userId: number; name: string } | null {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number; email: string; userType: string; name: string;
    };
    return { userId: decoded.userId, name: decoded.name };
  } catch {
    return null;
  }
}

// ── GET /api/reviews?productType=polo-t-shirt&productSlug=solid-polo-t-shirts ──

export async function GET(req: NextRequest) {
  const productType = req.nextUrl.searchParams.get("productType");
  const productSlug = req.nextUrl.searchParams.get("productSlug");

  if (!productType || !productSlug) {
    return NextResponse.json({ error: "productType and productSlug are required" }, { status: 400 });
  }

  try {
    const [reviewRows] = await pool.execute(
      `SELECT id, user_name, rating, review_text, verified, created_at
       FROM reviews
       WHERE product_type = ? AND product_slug = ?
       ORDER BY created_at DESC`,
      [productType, productSlug]
    );
    const reviews = reviewRows as ReviewRow[];

    if (reviews.length === 0) {
      return NextResponse.json({
        reviews: [],
        summary: { average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      });
    }

    const reviewIds = reviews.map((r) => r.id);
    const [mediaRows] = await pool.query(
      `SELECT review_id, media_type, url FROM review_media WHERE review_id IN (?)`,
      [reviewIds]
    );
    const media = mediaRows as (ReviewMediaRow & { review_id: number })[];

    const mediaByReview = new Map<number, ReviewMediaRow[]>();
    for (const m of media) {
      const list = mediaByReview.get(m.review_id) ?? [];
      list.push({ media_type: m.media_type, url: m.url });
      mediaByReview.set(m.review_id, list);
    }

    const result = reviews.map((r) => ({
      id: String(r.id),
      userName: r.user_name,
      rating: r.rating,
      text: r.review_text ?? "",
      verified: !!r.verified,
      createdAt: r.created_at,
      media: (mediaByReview.get(r.id) ?? []).map((m) => ({ type: m.media_type, url: m.url })),
    }));

    const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const r of reviews) {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      breakdown[rounded] += 1;
      sum += r.rating;
    }

    return NextResponse.json({
      reviews: result,
      summary: { average: sum / reviews.length, total: reviews.length, breakdown },
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Could not load reviews" }, { status: 500 });
  }
}

// ── POST /api/reviews ──────────────────────────────────────────────────────
// multipart/form-data: productType, productSlug, rating, text, media (0-6 files)

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Please log in to submit a review." }, { status: 401 });
  }

  const formData = await req.formData();
  const productType = formData.get("productType")?.toString();
  const productSlug = formData.get("productSlug")?.toString();
  const ratingRaw = formData.get("rating")?.toString();
  const text = formData.get("text")?.toString() ?? "";
  const files = formData.getAll("media").filter((f): f is File => f instanceof File);

  if (!productType || !productSlug) {
    return NextResponse.json({ error: "productType and productSlug are required" }, { status: 400 });
  }
  const rating = Number(ratingRaw);
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "A rating between 1 and 5 is required" }, { status: 400 });
  }
  if (!text.trim() && files.length === 0) {
    return NextResponse.json({ error: "Please add review text or at least one photo/video" }, { status: 400 });
  }
  if (files.length > 6) {
    return NextResponse.json({ error: "You can upload up to 6 photos/videos" }, { status: 400 });
  }

  try {
    // 1. Insert the review row
    const [insertResult] = await pool.execute(
      `INSERT INTO reviews (product_type, product_slug, user_id, user_name, rating, review_text, verified)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [productType, productSlug, user.userId, user.name, rating, text.trim() || null]
    );
    const reviewId = (insertResult as any).insertId as number;

    // 2. Save uploaded files to disk and insert media rows.
    // NOTE: If you deploy on a platform without a persistent filesystem
    // (e.g. Vercel), swap this for S3/Cloudinary — local writes there
    // won't survive a redeploy.
    const uploadDir = path.join(process.cwd(), "public", "uploads", "reviews");
    await mkdir(uploadDir, { recursive: true });

    const media: { type: "image" | "video"; url: string }[] = [];
    for (const file of files) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop() || (file.type.startsWith("video/") ? "mp4" : "jpg");
      const filename = `${reviewId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      await writeFile(path.join(uploadDir, filename), bytes);
      const type: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
      const url = `/uploads/reviews/${filename}`;
      media.push({ type, url });

      await pool.execute(
        `INSERT INTO review_media (review_id, media_type, url) VALUES (?, ?, ?)`,
        [reviewId, type, url]
      );
    }

    return NextResponse.json(
      {
        id: String(reviewId),
        userName: user.name,
        rating,
        text: text.trim(),
        verified: false,
        createdAt: new Date().toISOString(),
        media,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Could not submit your review. Please try again." }, { status: 500 });
  }
}