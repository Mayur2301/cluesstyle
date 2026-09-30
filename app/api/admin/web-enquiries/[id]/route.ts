// PATH: app/api/admin/web-enquiries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/app/lib/admin-auth";
import {
  getWebEnquiryById,
  isValidWebEnquiryStatus,
  updateWebEnquiryStatus,
} from "@/app/lib/web-enquiries";

// PATCH /api/admin/web-enquiries/[id] — update an inquiry's status
// (new/contacted/quoted/closed). Same requireAdminSession cookie-session
// auth as every other /api/admin/** route (returns, contact-messages, …).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid enquiry id." }, { status: 400 });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const { status } = body ?? {};

    if (!isValidWebEnquiryStatus(status)) {
      return NextResponse.json(
        { error: "status must be one of: new, contacted, quoted, closed." },
        { status: 400 }
      );
    }

    const existing = await getWebEnquiryById(id);
    if (!existing) {
      return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    }

    await updateWebEnquiryStatus(id, status);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[admin/web-enquiries PATCH]", err);
    return NextResponse.json(
      { error: err?.message || "Could not update enquiry. Check server logs for details." },
      { status: 500 }
    );
  }
}