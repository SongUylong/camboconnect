import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import b2Storage from '@/lib/b2storage';
import { db } from '@/lib/prisma';

// Directory for temporary file storage
const UPLOAD_DIR = path.join(process.cwd(), 'tmp/uploads');

// Image processing constants
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const JPEG_QUALITY = 80;

export async function POST(req: NextRequest) {
  // Track file paths for cleanup
  const tempFilePaths: string[] = [];
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    
    // Parse form data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    
    // Check file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File is not an image' }, { status: 400 });
    }
    
    // Generate unique filenames
    const userId = session.user.id;
    const fileUuid = uuidv4();
    const originalExt = imageFile.name.split('.').pop() || 'jpg';
    const tempFilePath = path.join(UPLOAD_DIR, `${fileUuid}-original.${originalExt}`);
    const processedFilePath = path.join(UPLOAD_DIR, `${fileUuid}.jpg`);
    
    // Track files for cleanup
    tempFilePaths.push(tempFilePath, processedFilePath);
    
    try {
      // Save original file temporarily
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      await writeFile(tempFilePath, fileBuffer);
      
      // Process image - resize and compress
      await sharp(tempFilePath)
        .resize({
          width: MAX_WIDTH,
          height: MAX_HEIGHT,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(processedFilePath);
      
      // Upload to B2 storage using the new formatting
      const fileName = `profile-images/${userId}/${fileUuid}.jpg`;
      const imageUrl = await b2Storage.uploadFile({
        filePath: processedFilePath,
        fileName: fileName,
        contentType: 'image/jpeg'
      });
      
      // Update user profile in database with the CDN URL
      const user = await db.user.update({
        where: { id: userId },
        data: {
          profileImage: imageUrl
        }
      });
      
      // Clean up temporary files immediately
      await Promise.all(tempFilePaths.map(async (filePath) => {
        if (existsSync(filePath)) {
          try {
            await unlink(filePath);
          } catch (err) {
            console.error(`Failed to delete temp file ${filePath}:`, err);
          }
        }
      }));
      
      return NextResponse.json({ 
        imageUrl, 
        success: true 
      });
    } catch (error) {
      console.error('Error processing image upload:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error handling profile upload:', error);
    
    // Cleanup any temp files if they exist (finalizer)
    if (tempFilePaths.length > 0) {
      await Promise.all(tempFilePaths.map(async (filePath) => {
        if (existsSync(filePath)) {
          try {
            await unlink(filePath);
            console.log(`Cleanup: Deleted temp file: ${filePath}`);
          } catch (err) {
            console.error(`Cleanup: Failed to delete temp file ${filePath}:`, err);
          }
        }
      }));
    }
    
    return NextResponse.json({ 
      error: 'Failed to process image upload' 
    }, { 
      status: 500 
    });
  }
}