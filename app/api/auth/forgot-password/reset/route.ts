// PATH: app/api/auth/forgot-password/reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/app/lib/db';
import { isRateLimited, clearRateLimit, clientIp } from '@/app/lib/simple-rate-limit';

// Max wrong codes before the current code is thrown away and a new one must
// be requested - 6 digits would otherwise be guessable by brute force.
const MAX_BAD_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const otp = typeof body?.otp === 'string' ? body.otp.trim() : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!email || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ message: 'Enter the 6-digit code from your email.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    if (newPassword.length > 72) {
      // bcrypt silently ignores anything past 72 bytes.
      return NextResponse.json({ message: 'Password is too long (max 72 characters).' }, { status: 400 });
    }

    // Throttle guesses per email and per IP.
    const attemptKey = `fp-reset:${email}`;
    if (isRateLimited(`fp-reset-ip:${clientIp(request.headers)}`, 30, ATTEMPT_WINDOW_MS)) {
      return NextResponse.json({ message: 'Too many attempts. Please try again later.' }, { status: 429 });
    }
    if (isRateLimited(attemptKey, MAX_BAD_ATTEMPTS, ATTEMPT_WINDOW_MS)) {
      await pool.execute(`UPDATE web_users SET otp_code = NULL, otp_expires_at = NULL WHERE email = ?`, [email]);
      return NextResponse.json(
        { message: 'Too many wrong attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT * FROM web_users WHERE email = ? AND otp_code = ? AND otp_expires_at > NOW() LIMIT 1`,
      [email, otp]
    );
    const user = (rows as any[])[0];
    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired code.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    // Clearing the code makes it single-use.
    await pool.execute(
      `UPDATE web_users SET password = ?, email_verified = 1, otp_code = NULL, otp_expires_at = NULL WHERE id = ?`,
      [hashed, user.id]
    );
    clearRateLimit(attemptKey);

    // Log the user in, exactly like /api/auth/login does.
    const userType = user.account_type || 'user';
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      token,
      userType,
      user: { id: user.id, name: user.name, email: user.email, userType },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Forgot-password reset error:', error);
    return NextResponse.json({ message: 'Could not reset the password. Please try again.' }, { status: 500 });
  }
}
