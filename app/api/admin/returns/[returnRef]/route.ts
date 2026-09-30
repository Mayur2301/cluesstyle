// PATH: app/api/admin/returns/[returnRef]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/app/lib/admin-auth";
import { query } from "@/app/lib/db";
import { getReturnByRef, isValidReturnStatus } from "@/app/lib/return-orders";

const MAX_NOTE_LENGTH = 2000;

// PATCH /api/admin/returns/[returnRef] — update status and/or admin_note.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ returnRef: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { returnRef } = await params;

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const { status, admin_note, refund_amount } = body ?? {};

    const updates: string[] = [];
    const values: any[] = [];

    if (status !== undefined) {
      if (!isValidReturnStatus(status)) {
        return NextResponse.json(
          { error: "status must be one of: requested, approved, rejected, picked_up, refunded, cancelled." },
          { status: 400 }
        );
      }
      updates.push("status = ?");
      values.push(status);
    }

    if (admin_note !== undefined) {
      if (typeof admin_note !== "string" || admin_note.length > MAX_NOTE_LENGTH) {
        return NextResponse.json(
          { error: `admin_note must be a string under ${MAX_NOTE_LENGTH} characters.` },
          { status: 400 }
        );
      }
      updates.push("admin_note = ?");
      values.push(admin_note.trim() || null);
    }

    if (refund_amount !== undefined) {
      const amount = refund_amount === null || refund_amount === "" ? null : Number(refund_amount);
      if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
        return NextResponse.json({ error: "refund_amount must be a non-negative number." }, { status: 400 });
      }
      updates.push("refund_amount = ?");
      values.push(amount);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Provide status, admin_note, and/or refund_amount to update." },
        { status: 400 }
      );
    }

    const existing = await getReturnByRef(returnRef);
    if (!existing) {
      return NextResponse.json({ error: "Return request not found." }, { status: 404 });
    }

    values.push(returnRef);
    await query(
      `UPDATE return_requests SET ${updates.join(", ")}, updated_at = NOW() WHERE return_ref = ?`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[admin/returns PATCH]", err);
    return NextResponse.json(
      { error: err?.message || "Could not update return request. Check server logs for details." },
      { status: 500 }
    );
  }
}
