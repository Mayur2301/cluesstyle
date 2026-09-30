// app/api/events/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: eventSlug } = await params;
    
    console.log('Fetching single event with slug:', eventSlug);
    
    // Match the same style as your working events API
    const sql = `
      SELECT 
        e.*,
        p.club_name,
        p.club_logo,
        p.club_description
      FROM web_club_events e
      LEFT JOIN web_club_profiles p ON e.club_id = p.user_id
      WHERE e.slug = ? AND e.is_published = 1
    `;
    
    const events = await query(sql, [eventSlug]);
    
    console.log('Query result length:', (events as any[]).length);
    
    if ((events as any[]).length === 0) {
      return NextResponse.json({ 
        error: 'Event not found',
        slug: eventSlug 
      }, { status: 404 });
    }
    
    const event = (events as any[])[0];
    
    return NextResponse.json({ 
      success: true,
      event: event
    });
    
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}