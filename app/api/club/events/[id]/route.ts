// app/api/club/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

async function verifyClubAuth(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email');
  
  if (!userEmail) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  const club = await query(
    'SELECT id, account_type FROM web_users WHERE email = ? AND account_type = "club"',
    [userEmail]
  );
  
  if (!club || (club as any[]).length === 0) {
    return { error: 'Club not found', status: 404 };
  }
  
  const clubId = (club as any[])[0].id;
  
  // Ensure club profile exists
  const profile = await query(
    'SELECT id FROM web_club_profiles WHERE user_id = ?',
    [clubId]
  );
  
  if ((profile as any[]).length === 0) {
    const clubData = await query(
      'SELECT name, email FROM web_users WHERE id = ?',
      [clubId]
    );
    const clubInfo = (clubData as any[])[0];
    
    await query(
      `INSERT INTO web_club_profiles (user_id, club_name, club_email, total_events, total_footfalls) 
       VALUES (?, ?, ?, 0, 0)`,
      [clubId, clubInfo?.name || 'Club', clubInfo?.email || '']
    );
  }
  
  return { clubId };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id: eventId } = await params;
    
    const auth = await verifyClubAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const clubId = auth.clubId;
    const body = await req.json();

    // Update event status based on dates if dates are being updated
    if (body.event_start_date || body.event_end_date) {
      const startDate = new Date(body.event_start_date || new Date());
      const endDate = new Date(body.event_end_date || new Date());
      const now = new Date();
      
      if (now >= startDate && now <= endDate) {
        body.event_status = 'ongoing';
      } else if (now > endDate) {
        body.event_status = 'completed';
      } else {
        body.event_status = 'upcoming';
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    const allowedFields = [
      'event_name', 'event_description', 'event_start_date',
      'event_end_date', 'event_location', 'expected_footfalls',
      'actual_footfalls', 'event_image', 'tshirt_front_image', 
      'tshirt_back_image', 'event_status', 'is_published'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(body[field] === null ? null : body[field]);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateValues.push(eventId, clubId);

    await query(
      `UPDATE web_club_events SET ${updateFields.join(', ')} WHERE id = ? AND club_id = ?`,
      updateValues
    );

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id: eventId } = await params;
    
    console.log('Deleting event with ID:', eventId);
    
    const auth = await verifyClubAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const clubId = auth.clubId;
    console.log('Club ID:', clubId);

    // First, get the event to ensure it exists and belongs to the club
    const event = await query(
      'SELECT id, expected_footfalls FROM web_club_events WHERE id = ? AND club_id = ?',
      [eventId, clubId]
    );

    if ((event as any[]).length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const expectedFootfalls = (event as any[])[0]?.expected_footfalls || 0;

    // Delete the event
    await query(
      'DELETE FROM web_club_events WHERE id = ? AND club_id = ?',
      [eventId, clubId]
    );

    // Update club profile total events count and footfalls
    await query(
      `UPDATE web_club_profiles 
       SET total_events = (SELECT COUNT(*) FROM web_club_events WHERE club_id = ?),
           total_footfalls = total_footfalls - ?
       WHERE user_id = ?`,
      [clubId, expectedFootfalls, clubId]
    );

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id: eventId } = await params;
    
    const auth = await verifyClubAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const clubId = auth.clubId;

    const events = await query(
      `SELECT * FROM web_club_events WHERE id = ? AND club_id = ?`,
      [eventId, clubId]
    );

    if ((events as any[]).length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event: (events as any[])[0] });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}