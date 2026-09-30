// PATH: app/api/admin/contact-messages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/app/lib/admin-auth";
import {
  getContactMessageById,
  isValidContactMessageStatus,
  updateContactMessageStatus,
} from "@/app/lib/contact-messages";

// PATCH /api/admin/contact-messages/[id] — update a message's status
// (unread/read/replied/archived). Uses the same cookie-session admin auth
// as the rest of /api/admin/** (requireAdminSession) — NOT the separate
// ADMIN_API_KEY bearer-token check on the GET in app/api/contact/route.ts,
// which is a different, older auth scheme left over from before the admin
// panel existed.
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
    return NextResponse.json({ error: "Invalid message id." }, { status: 400 });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const { status } = body ?? {};

    if (!isValidContactMessageStatus(status)) {
      return NextResponse.json(
        { error: "status must be one of: unread, read, replied, archived." },
        { status: 400 }
      );
    }

    const existing = await getContactMessageById(id);
    if (!existing) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    await updateContactMessageStatus(id, status);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[admin/contact-messages PATCH]", err);
    return NextResponse.json(
      { error: err?.message || "Could not update message. Check server logs for details." },
      { status: 500 }
    );
  }
}