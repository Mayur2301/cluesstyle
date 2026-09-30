// app/api/club/events/route.ts
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

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyClubAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const clubId = auth.clubId;
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM web_club_events WHERE club_id = ?';
    const params: any[] = [clubId];

    if (status && status !== 'all') {
      sql += ' AND event_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY event_start_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const events = await query(sql, params);
    
    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM web_club_events WHERE club_id = ?';
    const countParams: any[] = [clubId];
    
    if (status && status !== 'all') {
      countSql += ' AND event_status = ?';
      countParams.push(status);
    }
    
    const totalResult = await query(countSql, countParams);
    const total = (totalResult as any[])[0]?.total || 0;

    return NextResponse.json({
      success: true,
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyClubAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const clubId = auth.clubId;
    const body = await req.json();
    
    const {
      event_name,
      event_description,
      event_start_date,
      event_end_date,
      event_location,
      expected_footfalls,
      event_image,
      tshirt_front_image,
      tshirt_back_image,
      is_published
    } = body;

    // Validate required fields
    if (!event_name || !event_start_date || !event_end_date) {
      return NextResponse.json(
        { error: 'Event name, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Validate event image is required
    if (!event_image) {
      return NextResponse.json(
        { error: 'Event image is required' },
        { status: 400 }
      );
    }

    // Determine event status based on dates
    const now = new Date();
    const startDate = new Date(event_start_date);
    const endDate = new Date(event_end_date);
    
    let event_status = 'upcoming';
    if (now >= startDate && now <= endDate) {
      event_status = 'ongoing';
    } else if (now > endDate) {
      event_status = 'completed';
    }

    // Insert event
    const result = await query(
      `INSERT INTO web_club_events (
        club_id, event_name, event_description, event_start_date, 
        event_end_date, event_location, expected_footfalls, 
        event_image, tshirt_front_image, tshirt_back_image, 
        event_status, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clubId, 
        event_name, 
        event_description || null, 
        event_start_date,
        event_end_date, 
        event_location || null, 
        expected_footfalls || 0,
        event_image, 
        tshirt_front_image || null, 
        tshirt_back_image || null,
        event_status, 
        is_published || false
      ]
    );

    // Update club profile total events count
    await query(
      `UPDATE web_club_profiles 
       SET total_events = total_events + 1,
           total_footfalls = total_footfalls + ?
       WHERE user_id = ?`,
      [expected_footfalls || 0, clubId]
    );

    return NextResponse.json({
      success: true,
      eventId: (result as any).insertId,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}