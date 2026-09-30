//app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, company, userType } = body;

    // 🔴 1. Validate required fields
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // 🔴 2. Check if user already exists
    const [existing] = await pool.execute(
      `SELECT id FROM web_users WHERE email = ?`,
      [email]
    );

    // 🔥 If user exists → UPDATE instead of blocking (important for OTP flow)
    if ((existing as any[]).length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.execute(
        `UPDATE web_users 
         SET name = ?, password = ?, phone = ?, company = ?, account_type = ?, email_verified = 1 
         WHERE email = ?`,
        [name, hashedPassword, phone || null, company || null, userType, email]
      );

      return NextResponse.json({
        success: true,
        message: 'Account updated successfully. Please login.'
      });
    }

    // 🔴 3. Hash password safely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔴 4. Insert new user
    const [result] = await pool.execute(
      `INSERT INTO web_users 
       (name, email, password, phone, company, account_type, approved, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        phone || null,
        company || null,
        userType,
        userType === 'user' ? 1 : 0,
        1
      ]
    );

    const insertId = (result as any).insertId;

    // 🔴 5. Generate JWT
    const token = jwt.sign(
      { userId: insertId, email, userType, name },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 🔴 6. Create response
    const response = NextResponse.json({
      success: true,
      token,
      userType,
      user: { id: insertId, name, email }
    });

    // 🔴 7. Secure cookie
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