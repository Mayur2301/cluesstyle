// app/api/upload-customized-tool/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const type = formData.get('type') as string || 'customized-tool';
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File must be an image (JPEG, PNG, WebP, or SVG)' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
    const extension = path.extname(originalName) || '.png';
    const filename = `customized_${timestamp}_${randomString}${extension}`;
    
    // Upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'customized-tool');
    
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Save file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Return URL
    const imageUrl = `/uploads/customized-tool/${filename}`;
    
    console.log('Customized tool upload successful:', imageUrl);
    
    return NextResponse.json({ 
      success: true, 
      url: imageUrl,
      filename: filename,
      type: type
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}