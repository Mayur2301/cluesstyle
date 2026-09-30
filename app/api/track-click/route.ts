/**
 * app/api/track-click/route.ts — cluesstyle.com
 *
 * Receives click events from CustomCursor and inserts them into the
 * click_events MySQL table (see click-events-migration.sql), which the
 * admin Heatmap page reads from.
 *
 * This used to append to public/logs/clicks.log instead — that file is no
 * longer written to by this route. If you have an existing clicks.log with
 * data you want to keep, run scripts/import-clicks-log.mjs once to bring it
 * into the database (optional — new clicks already go straight to MySQL).
 *
 * Place this file at:  app/api/track-click/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

interface ClickPayload {
  href?: unknown;
  text?: unknown;
  page?: unknown;
  x?: unknown;
  y?: unknown;
  viewportWidth?: unknown;
  viewportHeight?: unknown;
  timestamp?: unknown;
  userAgent?: unknown;
}

function toValidDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ClickPayload;

    // Basic validation — x/y/page are the only fields we actually rely on
    // downstream; everything else degrades gracefully to NULL.
    if (
      !body ||
      typeof body !== "object" ||
      typeof body.x !== "number" ||
      typeof body.y !== "number" ||
      typeof body.page !== "string" ||
      !body.page
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    const viewportWidth = typeof body.viewportWidth === "number" ? Math.round(body.viewportWidth) : null;
    const viewportHeight = typeof body.viewportHeight === "number" ? Math.round(body.viewportHeight) : null;
    const clientTimestamp = toValidDate(body.timestamp);

    await query(
      `INSERT INTO click_events
        (page, href, click_text, x, y, viewport_width, viewport_height, client_timestamp, server_time, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        String(body.page).slice(0, 255),
        typeof body.href === "string" ? body.href.slice(0, 500) : null,
        typeof body.text === "string" ? body.text.slice(0, 150) : null,
        Math.round(body.x),
        Math.round(body.y),
        viewportWidth,
        viewportHeight,
        clientTimestamp,
        ip,
        typeof body.userAgent === "string" ? body.userAgent.slice(0, 255) : null,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Tracking is non-critical — CustomCursor's own fetch call already
    // swallows errors silently, so a 500 here only ever shows up in server
    // logs, never breaks the storefront for a visitor.
    console.error("[track-click] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Reject non-POST methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}