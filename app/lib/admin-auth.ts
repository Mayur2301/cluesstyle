// PATH: app/lib/admin-auth.ts
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const ADMIN_SESSION_MAX_AGE = SESSION_DURATION_SECONDS;

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_JWT_SECRET is missing or shorter than 32 characters. " +
        "Set a long random string in your environment variables " +
        "(e.g. `openssl rand -base64 48`)."
    );
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "superadmin";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signAdminSession(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminSession(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: (payload.name as string) ?? "",
      role: payload.role as AdminSessionPayload["role"],
    };
  } catch {
    return null;
  }
}

// Reads the admin session cookie straight from the request and verifies
// it — for use INSIDE an /api/admin/** route handler itself.
//
// app/middleware.ts's matcher only covers /account and /dashboard/:path*,
// NOT /api/admin/** (a comment on app/api/admin/orders/export/route.ts
// already flags this) — so every /api/admin/** route must check the
// session itself rather than assume middleware already did. At least two
// routes (app/api/admin/orders/[orderRef]/route.ts and its
// send-shipping-update/route.ts) were shipped without ANY check at all —
// this helper exists so new routes don't repeat that mistake, and so those
// two can be fixed with a one-line import instead of copy-pasting the
// cookies()+verifyAdminSession boilerplate everywhere.
export async function requireAdminSession(): Promise<AdminSessionPayload | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminSession(token) : null;
}