//app/api/auth/login/route
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const [rows] = await pool.execute(
      `SELECT * FROM web_users WHERE email = ?`,
      [email]
    );

    const users = rows as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ✅ Ensure userType exists
    const userType = user.account_type || 'user';

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType,
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      token,
      userType, // ✅ ALWAYS RETURNED
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType // ✅ ALSO INCLUDED HERE
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}