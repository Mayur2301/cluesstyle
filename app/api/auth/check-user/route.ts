//app/api/auth/check-user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const [rows] = await pool.execute(`SELECT id FROM web_users WHERE email = ?`, [email]);
    const users = rows as any[];
    
    return NextResponse.json({ exists: users.length > 0 });
  } catch (error) {
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}