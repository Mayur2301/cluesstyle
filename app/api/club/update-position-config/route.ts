// app/api/club/update-position-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_id, position_config } = body;
    
    // Validate
    if (!event_id || !position_config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Save position configuration to database
    await query(
      `UPDATE web_club_events 
       SET position_config = ? 
       WHERE id = ?`,
      [JSON.stringify(position_config), event_id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Position configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving position config:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}