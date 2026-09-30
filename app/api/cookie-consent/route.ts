import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  // save ip + timestamp to your DB here
  return NextResponse.json({ ok: true });
}