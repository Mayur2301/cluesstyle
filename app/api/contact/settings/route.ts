// app/api/contact/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    const settings = await query(
      `SELECT * FROM web_contact_settings LIMIT 1`,
      []
    );
    
    return NextResponse.json({
      success: true,
      data: (settings as any[])[0] || null
    });
  } catch (error) {
    console.error('Error fetching contact settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// Admin only - Update settings
export async function PUT(req: NextRequest) {
  try {
    // Add authentication check here
    const authToken = req.headers.get('authorization');
    
    if (!authToken || authToken !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      company_name,
      company_email,
      support_email,
      phone,
      whatsapp,
      address,
      map_embed_url,
      business_hours,
      social_links
    } = body;

    await query(
      `UPDATE web_contact_settings 
       SET company_name = ?, company_email = ?, support_email = ?, 
           phone = ?, whatsapp = ?, address = ?, map_embed_url = ?,
           business_hours = ?, social_links = ?
       WHERE id = 1`,
      [
        company_name, company_email, support_email,
        phone, whatsapp, address, map_embed_url,
        JSON.stringify(business_hours),
        JSON.stringify(social_links)
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}