// PATH: app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/lib/db";
import {
  verifyPassword,
  signAdminSession,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
} from "@/app/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const pool = getPool();
    const [rows]: any = await pool.query(
      `SELECT id, name, email, password_hash, role FROM admins WHERE email = ? LIMIT 1`,
      [String(email).trim().toLowerCase()]
    );

    const genericError = () =>
      NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    if (!rows.length) return genericError();

    const admin = rows[0];
    const ok = await verifyPassword(password, admin.password_hash);
    if (!ok) return genericError();

    const session = await signAdminSession({
      sub: String(admin.id),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const res = NextResponse.json({
      success: true,
      admin: { name: admin.name, email: admin.email, role: admin.role },
    });

    res.cookies.set(ADMIN_SESSION_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return res;
  } catch (err: any) {
    console.error("[admin/login]", err);
    return NextResponse.json({ error: "Could not log in." }, { status: 500 });
  }
}