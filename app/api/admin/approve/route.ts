// PATH: app/api/admin/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// Was creating its own separate `mysql.createPool()` here, on top of the
// shared pool in app/lib/db.ts — every route that did this opened its own
// extra 10-connection pool, and all of them together were a major
// contributor to "Too many connections" against MySQL. Use the one shared
// pool instead, same as every other route in the app.
import { getPool } from '@/app/lib/db';

const pool = getPool();

export async function POST(request: NextRequest) {
  try {
    const { userId, approve } = await request.json();
    const authToken = request.cookies.get('token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin (you can add an is_admin column to web_users)
    // For now, let's check if email is admin@cluesstyle.com
    const [adminCheck] = await pool.execute(
      `SELECT * FROM web_users WHERE id = ? AND email = 'admin@cluesstyle.com'`,
      [decoded.userId]
    );
    
    if ((adminCheck as any[]).length === 0) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await pool.execute(
      `UPDATE web_users SET approved = ? WHERE id = ?`,
      [approve, userId]
    );

    return NextResponse.json({
      message: `User ${approve ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}