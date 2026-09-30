// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
    console.log('Fetching events...');
    
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    
    // If slug parameter is provided, return single event
    if (slug) {
      console.log('Fetching single event with slug:', slug);
      
      const events = await query(
        `SELECT 
          e.*,
          p.club_name,
          p.club_logo,
          p.club_description
        FROM web_club_events e
        LEFT JOIN web_club_profiles p ON e.club_id = p.user_id
        WHERE e.slug = ? AND e.is_published = 1`,
        [slug]
      );
      
      if ((events as any[]).length === 0) {
        return NextResponse.json({ 
          error: 'Event not found',
          slug: slug 
        }, { status: 404 });
      }
      
      const event = (events as any[])[0];
      
      return NextResponse.json({ 
        success: true, 
        event: {
          ...event,
          has_tshirt_images: !!(event.tshirt_front_image || event.tshirt_back_image)
        }
      });
    }
    
    // Otherwise, return all events (existing code)
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT 
        e.*,
        p.club_name,
        p.club_logo
      FROM web_club_events e
      LEFT JOIN web_club_profiles p ON e.club_id = p.user_id
      WHERE e.is_published = 1
    `;
    
    const params: any[] = [];

    // Filter by status
    if (status && status !== 'all') {
      sql += ' AND e.event_status = ?';
      params.push(status);
    }

    // Filter by location
    if (location && location !== 'all') {
      sql += ' AND e.event_location = ?';
      params.push(location);
    }

    // Search by name or description
    if (search) {
      sql += ' AND (e.event_name LIKE ? OR e.event_description LIKE ? OR e.event_location LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Sort: upcoming first, then ongoing, then completed
    sql += `
      ORDER BY 
        CASE e.event_status
          WHEN 'upcoming' THEN 1
          WHEN 'ongoing' THEN 2
          WHEN 'completed' THEN 3
          WHEN 'cancelled' THEN 4
        END,
        e.event_start_date ASC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);

    const events = await query(sql, params);
    console.log('Events found:', (events as any[]).length);

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM web_club_events e
      WHERE e.is_published = 1
    `;
    const countParams: any[] = [];

    if (status && status !== 'all') {
      countSql += ' AND e.event_status = ?';
      countParams.push(status);
    }

    if (location && location !== 'all') {
      countSql += ' AND e.event_location = ?';
      countParams.push(location);
    }

    if (search) {
      countSql += ' AND (e.event_name LIKE ? OR e.event_description LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }

    const totalResult = await query(countSql, countParams);
    const total = (totalResult as any[])[0]?.total || 0;

    return NextResponse.json({
      success: true,
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + (events as any[]).length < total
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}