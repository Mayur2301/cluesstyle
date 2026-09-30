// PATH: app/api/dashboard/user/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// NOTE: this route previously created its own unused `mysql.createPool()`
// (on top of the shared pool in app/lib/db.ts) — it was never actually
// queried anywhere below (stats/recentOrders are hardcoded placeholders),
// so it was dead code. Removed rather than pointed at the shared pool,
// since nothing here talks to the database yet. If this route starts
// querying real data, use `import { getPool } from '@/app/lib/db'` like
// every other route in the app, not a new standalone pool.

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Fetch user stats
    const stats = {
      orders: 0,
      wishlist: 0,
      reviews: 0,
      points: 1250
    };
    
    const recentOrders: never[] = [];

    return NextResponse.json({ stats, recentOrders });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}