// app/api/events/[slug]/sponsorship/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// ✅ Define type OUTSIDE (important)
type PositionConfigType = {
  [key: string]: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    enabled?: boolean;
    shape?: string;
  };
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: eventSlug } = await context.params;

    // ✅ Fetch event
    const eventResult = await query<any[]>(
      `SELECT 
        e.id, 
        e.slug, 
        e.event_name,
        e.tshirt_front_image, 
        e.tshirt_back_image,
        e.position_config
      FROM web_club_events e
      WHERE e.slug = ? AND e.is_published = 1
      LIMIT 1`,
      [eventSlug]
    );

    if (eventResult.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = eventResult[0];

    // ✅ Parse config safely
    let positionConfig: PositionConfigType = {};
    if (event.position_config) {
      try {
        positionConfig = JSON.parse(event.position_config);
      } catch (e) {
        console.error('Invalid position_config JSON');
      }
    }

    // ✅ Fetch positions
    const positions = await query<any[]>(
      `SELECT 
        p.position_key,
        p.position_name,
        p.description,
        p.base_price,
        s.id as sponsorship_id,
        s.sponsor_name,
        s.sponsor_logo,
        s.payment_status,
        s.logo_shape as sponsor_logo_shape,
        s.logo_dimensions,
        s.booking_date
      FROM t_shirt_positions p
      LEFT JOIN event_sponsorships s 
        ON p.position_key = s.position_key 
        AND s.event_id = ? 
        AND s.status = 'active'
        AND s.payment_status IN ('completed', 'captured')
      WHERE p.is_active = 1
      ORDER BY p.sort_order`,
      [event.id]
    );

    console.log(
      'Raw positions:',
      positions.map((p) => ({
        key: p.position_key,
        booked: !!p.sponsorship_id,
      }))
    );

    // ✅ IMPORTANT: Preserve your exact structure
    const positionsWithConfig = positions.map((pos) => {
      const config = positionConfig[pos.position_key] || {};

      // ✅ Use ?? instead of ||
      let logoWidth =
        config.width ??
        (pos.position_key === 'center'
          ? 120
          : pos.position_key === 'back'
          ? 200
          : 60);

      let logoHeight =
        config.height ??
        (pos.position_key === 'center'
          ? 80
          : pos.position_key === 'back'
          ? 150
          : 60);

      // ✅ Parse DB dimensions
      if (pos.logo_dimensions) {
        try {
          const dimensions = JSON.parse(pos.logo_dimensions);
          logoWidth = dimensions.width ?? logoWidth;
          logoHeight = dimensions.height ?? logoHeight;
        } catch {}
      }

      // ✅ Fix logo URL
      let sponsorLogo = pos.sponsor_logo;
      if (
        sponsorLogo &&
        !sponsorLogo.startsWith('http') &&
        !sponsorLogo.startsWith('/')
      ) {
        sponsorLogo = '/' + sponsorLogo;
      }

      return {
        ...pos,

        // 🔥 IMPORTANT FOR FRONTEND
        is_booked:
          !!pos.sponsorship_id &&
          (pos.payment_status === 'completed' ||
            pos.payment_status === 'captured'),

        sponsor_name: pos.sponsor_name || null,
        sponsor_logo: sponsorLogo || null,

        // 🔥 THIS CONTROLS VISIBILITY IN UI
        enabled: config.enabled ?? true,

        coordinates: {
          x:
            config.x ??
            (pos.position_key === 'left_chest'
              ? 22
              : pos.position_key === 'right_chest'
              ? 58
              : pos.position_key === 'center'
              ? 40
              : 40),
          y:
            config.y ??
            (pos.position_key === 'left_chest'
              ? 28
              : pos.position_key === 'right_chest'
              ? 28
              : pos.position_key === 'center'
              ? 55
              : 35),
        },

        logo_shape: config.shape ?? pos.sponsor_logo_shape ?? 'circular',

        // 🔥 KEEP THESE EXACT (frontend depends on it)
        logo_width: logoWidth,
        logo_height: logoHeight,
      };
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        name: event.event_name,
        tshirt_front: event.tshirt_front_image,
        tshirt_back: event.tshirt_back_image,
      },
      positions: positionsWithConfig,
    });
  } catch (error) {
    console.error('❌ API Error:', error);

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}