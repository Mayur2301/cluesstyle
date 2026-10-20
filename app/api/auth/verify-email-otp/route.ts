import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { signEmailVerificationToken } from '@/app/lib/email-verification-token';
import { isRateLimited, clearRateLimit, clientIp } from '@/app/lib/simple-rate-limit';

// 6 digits is only 1,000,000 possibilities, so wrong guesses are capped.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const otp = typeof body?.otp === 'string' ? body.otp.trim() : '';

    if (!email || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ message: 'Enter the 6-digit code from your email.' }, { status: 400 });
    }

    const attemptKey = `verify-otp:${email}`;
    if (
      isRateLimited(`verify-otp-ip:${clientIp(request.headers)}`, 30, WINDOW_MS) ||
      isRateLimited(attemptKey, MAX_ATTEMPTS, WINDOW_MS)
    ) {
      await pool.execute(`UPDATE web_users SET otp_code = NULL, otp_expires_at = NULL WHERE email = ?`, [email]);
      return NextResponse.json(
        { message: 'Too many attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT * FROM web_users WHERE email = ? AND otp_code = ? AND otp_expires_at > NOW()`,
      [email, otp]
    );

    const users = rows as any[];

    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    const user = users[0];
    await pool.execute(`UPDATE web_users SET email_verified = 1, otp_code = NULL, otp_expires_at = NULL WHERE email = ?`, [email]);
    clearRateLimit(attemptKey);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      name: user.name,
      userType: user.account_type,
      // Short-lived proof that this caller owns the email; /api/auth/register
      // refuses to create or complete an account without it.
      verificationToken: signEmailVerificationToken(email),
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to verify OTP' }, { status: 500 });
  }
}
