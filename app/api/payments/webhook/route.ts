// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    switch (eventType) {
      case 'payment.captured':
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        
        // Update sponsorship status
        await query(
          `UPDATE event_sponsorships 
           SET payment_status = 'captured',
               payment_id = ?,
               payment_completed_at = NOW()
           WHERE razorpay_order_id = ? AND payment_status = 'completed'`,
          [payment.id, orderId]
        );
        break;

      case 'payment.failed':
        const failedPayment = payload.payment.entity;
        const failedOrderId = failedPayment.order_id;
        
        await query(
          `UPDATE event_sponsorships 
           SET payment_status = 'failed',
               payment_error = ?
           WHERE razorpay_order_id = ?`,
          [failedPayment.error_description || 'Payment failed', failedOrderId]
        );
        break;

      case 'refund.created':
        const refund = payload.refund.entity;
        await query(
          `UPDATE event_sponsorships 
           SET payment_status = 'refunded',
               refund_id = ?,
               refund_amount = ?
           WHERE payment_id = ?`,
          [refund.id, refund.amount / 100, refund.payment_id]
        );
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}