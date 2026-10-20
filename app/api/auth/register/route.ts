//app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/app/lib/db';
import { isValidEmailVerificationToken } from '@/app/lib/email-verification-token';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, password, phone, company, userType, verificationToken } = body;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    // 🔴 1. Validate required fields
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
      return NextResponse.json(
        { message: 'Password must be between 6 and 72 characters' },
        { status: 400 }
      );
    }

    // 🔴 2. The caller must have just proven they own this email by entering
    // the emailed code (see /api/auth/verify-email-otp). Without this anyone
    // could create - or take over - an account for somebody else's email.
    if (!isValidEmailVerificationToken(verificationToken, email)) {
      return NextResponse.json(
        { message: 'Please verify your email before creating an account.' },
        { status: 403 }
      );
    }

    // 🔴 3. Look for an existing row
    const [existing] = await pool.execute(
      `SELECT id, password FROM web_users WHERE email = ?`,
      [email]
    );
    const existingUser = (existing as any[])[0];

    // A row that already has a password is a real account: NEVER overwrite
    // it from here (that was an account-takeover hole). They can log in, or
    // use "Forgot password?".
    if (existingUser?.password) {
      return NextResponse.json(
        { message: 'An account with this email already exists. Please log in, or use "Forgot password?".' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const approved = userType === 'user' ? 1 : 0;
    let userId: number;

    if (existingUser) {
      // The password-less placeholder row that /api/auth/send-email-otp creates
      // while the signup code is being verified - complete it.
      await pool.execute(
        `UPDATE web_users
            SET name = ?, password = ?, phone = ?, company = ?, account_type = ?, approved = ?, email_verified = 1
          WHERE id = ?`,
        [name, hashedPassword, phone || null, company || null, userType, approved, existingUser.id]
      );
      userId = existingUser.id;
    } else {
      const [result] = await pool.execute(
        `INSERT INTO web_users
         (name, email, password, phone, company, account_type, approved, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, phone || null, company || null, userType, approved, 1]
      );
      userId = (result as any).insertId;
    }

    // 🔴 4. Generate JWT
    const token = jwt.sign(
      { userId, email, userType, name },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 🔴 5. Create response
    const response = NextResponse.json({
      success: true,
      token,
      userType,
      user: { id: userId, name, email, userType }
    });

    // 🔴 6. Secure cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
