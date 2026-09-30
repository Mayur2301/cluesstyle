import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

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

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully',
      name: user.name,
      userType: user.account_type
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to verify OTP' }, { status: 500 });
  }
}