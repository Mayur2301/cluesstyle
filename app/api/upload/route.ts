// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// ✅ Allowed types config
const uploadConfig = {
  event: {
    folder: 'events',
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  front: {
    folder: 'tshirts',
    maxSize: 10 * 1024 * 1024,
  },
  back: {
    folder: 'tshirts',
    maxSize: 10 * 1024 * 1024,
  },
  sponsor_logo: {
    folder: 'sponsors',
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('image') as File;
    const type = (formData.get('type') as string) || 'sponsor_logo';

    // ✅ Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WEBP allowed' },
        { status: 400 }
      );
    }

    // ✅ Validate type
    const config = uploadConfig[type as keyof typeof uploadConfig];
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      );
    }

    // ✅ File size check
    if (file.size > config.maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Max size: ${config.maxSize / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // ✅ Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Clean filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const ext = path.extname(file.name) || '.png';

    const filename = `${type}_${timestamp}_${random}${ext}`;

    // ✅ Folder path
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      config.folder
    );

    // ✅ Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // ✅ Save file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // ✅ Public URL
    const imageUrl = `/uploads/${config.folder}/${filename}`;

    console.log('✅ Upload success:', imageUrl);

    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename,
      type,
      size: file.size,
    });
  } catch (error) {
    console.error('❌ Upload error:', error);

    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}