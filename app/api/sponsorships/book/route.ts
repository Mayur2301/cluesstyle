// app/api/sponsorships/book/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_id,
      position_key,
      sponsor_id,
      sponsor_name,
      sponsor_email,
      sponsor_logo,
      amount,
      logo_shape,
      logo_dimensions
    } = body;

    console.log('Booking request received:', {
      event_id,
      position_key,
      sponsor_id,
      sponsor_name,
      sponsor_email,
      sponsor_logo,
      amount,
      logo_shape,
      logo_dimensions
    });

    // Validate required fields
    if (!event_id || !position_key || !sponsor_id || !sponsor_name || !sponsor_email || !sponsor_logo || !amount) {
      console.log('Missing required fields:', { event_id, position_key, sponsor_id, sponsor_name, sponsor_email, sponsor_logo, amount });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the event exists and is published
    const eventCheck = await query(
      'SELECT id, event_name, event_status FROM web_club_events WHERE id = ? AND is_published = 1',
      [event_id]
    );

    if ((eventCheck as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Event not found or not published' },
        { status: 404 }
      );
    }

    const event = (eventCheck as any[])[0];
    
    // Check if event is still active for sponsorships
    if (event.event_status === 'completed' || event.event_status === 'cancelled') {
      return NextResponse.json(
        { error: 'This event is no longer accepting sponsorships' },
        { status: 400 }
      );
    }

    // Check if position is already booked for this event
    const existingBooking = await query(
      `SELECT id, sponsor_name, payment_status 
       FROM event_sponsorships 
       WHERE event_id = ? AND position_key = ? 
       AND status = 'active' 
       AND payment_status IN ('completed', 'captured', 'pending')`,
      [event_id, position_key]
    );

    if ((existingBooking as any[]).length > 0) {
      const booking = (existingBooking as any[])[0];
      return NextResponse.json(
        { 
          error: `This position is already booked${booking.sponsor_name ? ` by ${booking.sponsor_name}` : ''}`,
          existing_booking: booking
        },
        { status: 409 }
      );
    }

    // Get position details and price
    const positionDetails = await query(
      'SELECT * FROM t_shirt_positions WHERE position_key = ? AND is_active = 1',
      [position_key]
    );

    let finalAmount = amount;
    if ((positionDetails as any[]).length > 0) {
      const position = (positionDetails as any[])[0];
      finalAmount = position.base_price;
    }

    // Create sponsorship record with pending payment
    const result = await query(
      `INSERT INTO event_sponsorships (
        event_id, 
        position_key, 
        sponsor_id, 
        sponsor_name, 
        sponsor_email, 
        sponsor_logo, 
        custom_price, 
        logo_shape,
        logo_dimensions,
        payment_status, 
        status,
        booking_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'active', NOW())`,
      [
        event_id,
        position_key,
        sponsor_id,
        sponsor_name,
        sponsor_email,
        sponsor_logo,
        finalAmount,
        logo_shape || 'circular',
        logo_dimensions ? JSON.stringify(logo_dimensions) : null,
      ]
    );

    const sponsorshipId = (result as any).insertId;

    console.log('Booking created successfully:', { sponsorshipId, sponsor_logo });

    // Log the booking creation
    await query(
      `INSERT INTO event_sponsor_logs (sponsorship_id, action, old_status, new_status, notes)
       VALUES (?, 'booking_created', NULL, 'pending', 'Sponsorship booking initiated with pending payment')`,
      [sponsorshipId]
    );

    return NextResponse.json({
      success: true,
      sponsorship_id: sponsorshipId,
      amount: finalAmount,
      position_key: position_key,
      sponsor_logo: sponsor_logo,
      message: 'Booking created successfully. Please complete payment.'
    });

  } catch (error) {
    console.error('Error creating sponsorship booking:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}