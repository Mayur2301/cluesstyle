// app/api/payments/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { razorpayInstance } from '@/app/lib/razorpay';
import { query } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sponsorship_id, amount, position_name, event_id, sponsor_id } = body;

    if (!sponsorship_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order in Razorpay
    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise (INR)
      currency: 'INR',
      receipt: `sponsorship_${sponsorship_id}`,
      notes: {
        sponsorship_id: sponsorship_id.toString(),
        event_id: event_id?.toString() || '',
        position_name: position_name || '',
        sponsor_id: sponsor_id?.toString() || ''
      }
    });

    // Update sponsorship record with order ID
    await query(
      `UPDATE event_sponsorships 
       SET razorpay_order_id = ?, order_amount = ? 
       WHERE id = ?`,
      [order.id, amount, sponsorship_id]
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}