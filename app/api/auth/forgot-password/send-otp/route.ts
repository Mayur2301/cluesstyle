// PATH: app/api/auth/forgot-password/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import pool from '@/app/lib/db';
import { mailTransporter, MAIL_FROM_ADDRESS } from '@/app/lib/mail-transport';
import { isRateLimited, clientIp } from '@/app/lib/simple-rate-limit';

const OTP_TTL_MS = 10 * 60 * 1000;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export async function POST(request: NextRequest) {
  // Same answer whether or not the email has an account, so this endpoint
  // can't be used to find out who is registered.
  const genericOk = NextResponse.json({
    success: true,
    message: 'If an account exists for this email, a verification code has been sent.',
  });

  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
    }

    // One code per minute per email, and a cap per IP, so this can't be used
    // to spam someone's inbox or burn through the mail quota.
    if (isRateLimited(`fp-send:${email}`, 1, 60 * 1000) || isRateLimited(`fp-send-ip:${clientIp(request.headers)}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { message: 'Please wait a minute before requesting another code.' },
        { status: 429 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT id, name FROM web_users WHERE email = ? AND password IS NOT NULL AND password <> '' LIMIT 1`,
      [email]
    );
    const user = (rows as any[])[0];
    if (!user) return genericOk;

    const otp = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await pool.execute(
      `UPDATE web_users SET otp_code = ?, otp_expires_at = ? WHERE id = ?`,
      [otp, expiresAt, user.id]
    );

    await mailTransporter.sendMail({
      from: `"CluesStyle" <${MAIL_FROM_ADDRESS}>`,
      to: email,
      subject: 'Reset your password - CluesStyle',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0;">CluesStyle</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${escapeHtml(user.name || 'there')}!</h2>
            <p>Use this code to reset your password:</p>
            <div style="background: white; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code is valid for 10 minutes. If you didn't ask to reset your password, you can ignore this email - your password won't change.</p>
          </div>
        </div>
      `,
    });

    return genericOk;
  } catch (error) {
    console.error('Forgot-password send-otp error:', error);
    return NextResponse.json({ message: 'Could not send the code. Please try again.' }, { status: 500 });
  }
}
