// app/api/user/orders/[orderRef]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/app/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderRef: string }> }
) {
  try {

    console.log('🔥 ORDER DETAIL API');

    const auth = req.headers.get('authorization') ?? '';

    const token = auth.startsWith('Bearer ')
      ? auth.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    let payload: any;

    try {
      payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
      );
    } catch (err) {

      console.log(err);

      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const email = payload.email;

    const { orderRef } = await context.params;

    console.log('EMAIL:', email);
    console.log('ORDER REF:', orderRef);

    if (!email || !orderRef) {

      return NextResponse.json(
        {
          error: 'Bad request',
          debug: {
            email,
            orderRef,
          },
        },
        { status: 400 }
      );
    }

    // TEMPORARY REMOVE EMAIL CHECK
    // TO VERIFY ROUTE WORKS

    const [rows]: any = await pool.execute(
      `
      SELECT
        id,
        order_ref,
        product_name,
        product_slug,
        product_url,
        selected_size,
        selected_color,
        quantity,
        delivery_type,
        price_per_unit,
        same_day_charge,
        grand_total,
        payment_status,
        order_status,
        razorpay_order_id,
        razorpay_payment_id,
        customer_name,
        customer_phone,
        customer_email,
        address_line1,
        address_line2,
        address_city,
        address_state,
        address_pincode,
        created_at,
        updated_at
      FROM orders
      WHERE order_ref = ?
      LIMIT 1
      `,
      [orderRef]
    );

    console.log('ROWS:', rows);

    if (!rows || rows.length === 0) {

      return NextResponse.json(
        {
          error: 'Order not found',
          debug: {
            orderRef,
            email,
          },
        },
        { status: 404 }
      );
    }

    // FIX NULL STATUS
    if (!rows[0].order_status) {
      rows[0].order_status = 'processing';
    }

    return NextResponse.json({
      order: rows[0],
    });

  } catch (err: any) {

    console.log(err);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: err?.message,
      },
      { status: 500 }
    );
  }
}