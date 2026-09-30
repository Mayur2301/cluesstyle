// PATH: app/api/admin/returns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/app/lib/admin-auth";
import { listReturnRequests } from "@/app/lib/return-orders";

// GET /api/admin/returns — used by the returns list page's client-side
// refresh after a status update; the initial page load reads straight
// from the DB server-side instead (same split as /api/admin/orders).
export async function GET(_req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const returns = await listReturnRequests();
  return NextResponse.json({ returns });
}
