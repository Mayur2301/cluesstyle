// app/api/user/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth  = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const email = payload.email;
    if (!email) {
      return NextResponse.json({ error: 'Token missing email' }, { status: 401 });
    }

    const [rows]: any = await pool.execute(
      `SELECT
         id, order_ref, product_name, product_slug,
         selected_size, selected_color,
         quantity, delivery_type,
         price_per_unit, same_day_charge, grand_total,
         payment_status, order_status,
         razorpay_payment_id,
         created_at
       FROM orders
       WHERE customer_email = ?
       ORDER BY created_at DESC`,
      [email]
    );

    return NextResponse.json({ orders: rows });
  } catch (err: any) {
    console.error('[GET /api/user/orders]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}