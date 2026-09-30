// PATH: app/api/admin/admins/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/lib/db";
import { verifyAdminSession, hashPassword, ADMIN_SESSION_COOKIE } from "@/app/lib/admin-auth";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC`
  );

  return NextResponse.json({ admins: rows });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const { name, email, password, role } = (await req.json()) ?? {};

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "name, email, and password are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 10) {
      return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });
    }

    const safeRole = role === "superadmin" ? "superadmin" : "admin";
    const pool = getPool();

    const [existing]: any = await pool.query(`SELECT id FROM admins WHERE email = ?`, [
      email.trim().toLowerCase(),
    ]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "An admin with that email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    await pool.query(
      `INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, safeRole]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[admin/admins POST]", err);
    return NextResponse.json({ error: "Could not create admin." }, { status: 500 });
  }
}