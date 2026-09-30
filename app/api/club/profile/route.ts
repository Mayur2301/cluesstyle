// app/api/club/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

async function verifyClubAuth(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email');
  
  if (!userEmail) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  // Use web_users table and account_type column
  const club = await query(
    'SELECT id, account_type, name, email FROM web_users WHERE email = ? AND account_type = "club"',
    [userEmail]
  );
  
  if (!club || (club as any[]).length === 0) {
    return { error: 'Club not found', status: 404 };
  }
  
  return { clubId: (club as any[])[0].id, clubData: (club as any[])[0] };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyClubAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const clubId = auth.clubId;

    const profile = await query(
      `SELECT * FROM web_club_profiles WHERE user_id = ?`,
      [clubId]
    );

    // Get event stats
    const stats = await query(
      `SELECT 
        COUNT(*) as total_events,
        SUM(expected_footfalls) as total_expected_footfalls,
        SUM(actual_footfalls) as total_actual_footfalls
       FROM web_club_events WHERE club_id = ?`,
      [clubId]
    );

    const statsResult = (stats as any[])[0] || { total_events: 0, total_expected_footfalls: 0, total_actual_footfalls: 0 };

    return NextResponse.json({
      profile: (profile as any[])[0] || null,
      stats: statsResult,
      user: auth.clubData
    });
  } catch (error) {
    console.error('Error fetching club profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}