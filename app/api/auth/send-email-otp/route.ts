// PATH: app/api/auth/send-email-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { mailTransporter, MAIL_FROM_ADDRESS } from '@/app/lib/mail-transport';
import { isRateLimited, clientIp } from '@/app/lib/simple-rate-limit';
// Was creating its own separate `mysql.createPool()` here, on top of the
// shared pool in app/lib/db.ts — every route that did this opened its own
// extra 10-connection pool, and all of them together were a major
// contributor to "Too many connections" against MySQL. Use the one shared
// pool instead, same as every other route in the app.
import { getPool } from '@/app/lib/db';

const pool = getPool();

const transporter = mailTransporter;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userType } = body;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'A valid email is required' },
        { status: 400 }
      );
    }

    // One code per minute per email and a cap per IP, so this can't be used
    // to spam an inbox or burn through the mail quota.
    if (
      isRateLimited(`signup-send:${email}`, 1, 60 * 1000) ||
      isRateLimited(`signup-send-ip:${clientIp(request.headers)}`, 10, 60 * 60 * 1000)
    ) {
      return NextResponse.json(
        { message: 'Please wait a minute before requesting another code.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP in database
    await pool.execute(
      `UPDATE web_users SET otp_code = ?, otp_expires_at = ? WHERE email = ?`,
      [otp, expiresAt, email]
    );

    // If email doesn't exist, insert temporary record
    const [existing] = await pool.execute(`SELECT id FROM web_users WHERE email = ?`, [email]);
    if ((existing as any[]).length === 0) {
      await pool.execute(
        `INSERT INTO web_users (name, email, otp_code, otp_expires_at, account_type) VALUES (?, ?, ?, ?, ?)`,
        [name || '', email, otp, expiresAt, userType || 'user']
      );
    }

    // Send email
    await transporter.sendMail({
      from: `"CluesStyle" <${MAIL_FROM_ADDRESS}>`,
      to: email,
      subject: 'Email Verification - CluesStyle',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">CluesStyle</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${name || 'there'}!</h2>
            <p>Your verification code is:</p>
            <div style="background: white; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code is valid for 10 minutes.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent to your email' 
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { message: 'Failed to send OTP email' },
      { status: 500 }
    );
  }
}