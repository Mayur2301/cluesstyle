// PATH: app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Was creating its own separate `mysql.createPool()` here, on top of the
// shared pool in app/lib/db.ts — every route that did this opened its own
// extra 10-connection pool, and all of them together were a major
// contributor to "Too many connections" against MySQL. Use the one shared
// pool instead, same as every other route in the app.
import { getPool } from '@/app/lib/db';

const pool = getPool();

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (token) {
      // Remove session from database
      await pool.execute(
        `DELETE FROM web_sessions WHERE token = ?`,
        [token]
      );
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    // Clear the cookie
    response.cookies.delete('token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}