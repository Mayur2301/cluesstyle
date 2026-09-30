// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      subject,
      message,
      service_interest,
      budget_range,
      heard_from
    } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Insert message into database
    const result = await query(
      `INSERT INTO web_contact_messages (
        name, email, phone, subject, message, 
        service_interest, budget_range, heard_from, 
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unread', NOW())`,
      [
        name,
        email,
        phone || null,
        subject,
        message,
        service_interest || null,
        budget_range || null,
        heard_from || null
      ]
    );

    // Optional: Send email notification (implement with nodemailer or similar)
    // await sendEmailNotification({ name, email, subject, message });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageId: (result as any).insertId
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for admin to fetch messages
export async function GET(req: NextRequest) {
  try {
    // Add authentication check here
    const authToken = req.headers.get('authorization');
    
    // Simple auth check - replace with your actual auth logic
    if (!authToken || authToken !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `SELECT * FROM web_contact_messages WHERE 1=1`;
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const messages = await query(sql, params);
    
    const countResult = await query(
      `SELECT COUNT(*) as total FROM web_contact_messages`,
      []
    );
    const total = (countResult as any[])[0]?.total || 0;

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + (messages as any[]).length < total
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}