// PATH: app/api/admin/bootstrap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/lib/db";
import {
  hashPassword,
  signAdminSession,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
} from "@/app/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!bootstrapSecret) {
      return NextResponse.json(
        { error: "Bootstrap is not configured (ADMIN_BOOTSTRAP_SECRET not set)." },
        { status: 500 }
      );
    }

    const { secret, name, email, password } = (await req.json()) ?? {};

    if (secret !== bootstrapSecret) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (password.length < 10) {
      return NextResponse.json(
        { error: "Password must be at least 10 characters." },
        { status: 400 }
      );
    }

    const pool = getPool();

    const [existing]: any = await pool.query(`SELECT id FROM admins LIMIT 1`);
    if (existing.length > 0) {
      return NextResponse.json(
        {
          error:
            "Bootstrap already used — an admin account already exists. " +
            "Ask an existing admin to create your account from the dashboard.",
        },
        { status: 403 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [result]: any = await pool.query(
      `INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, 'superadmin')`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const session = await signAdminSession({
      sub: String(result.insertId),
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: "superadmin",
    });

    const res = NextResponse.json({
      success: true,
      admin: { name: name.trim(), email: email.trim().toLowerCase(), role: "superadmin" },
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
    console.error("[admin/bootstrap]", err);
    return NextResponse.json({ error: "Could not create admin account." }, { status: 500 });
  }
}