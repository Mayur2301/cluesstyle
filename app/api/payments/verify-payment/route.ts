// app/api/payments/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      sponsorship_id
    } = body;

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update sponsorship record
    await query(
      `UPDATE event_sponsorships 
       SET payment_status = 'completed', 
           payment_id = ?,
           payment_completed_at = NOW()
       WHERE id = ? AND razorpay_order_id = ?`,
      [razorpay_payment_id, sponsorship_id, razorpay_order_id]
    );

    // Get the sponsorship details for response
    const sponsorship = await query(
      `SELECT s.*, e.slug as event_slug 
       FROM event_sponsorships s
       JOIN web_club_events e ON s.event_id = e.id
       WHERE s.id = ?`,
      [sponsorship_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      sponsorship: (sponsorship as any[])[0]
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}