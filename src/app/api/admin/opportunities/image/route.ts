import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import b2Storage from '@/lib/b2storage';
import { db } from '@/lib/prisma'; // Make sure db is imported if needed for checks, though not strictly necessary here

// Directory for temporary file storage
const UPLOAD_DIR = path.join(process.cwd(), 'tmp/uploads/opportunities'); // Use a specific subdirectory

// Image processing constants (adjust if needed for opportunity images)
const MAX_WIDTH = 1200; // Maybe larger for opportunity hero images
const MAX_HEIGHT = 630; // Common aspect ratio for social sharing
const JPEG_QUALITY = 85;

export async function POST(req: NextRequest) {
  const tempFilePaths: string[] = [];

  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isAdmin) { // Check for admin role
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

    // Check file size (e.g., 5MB limit) - Optional but recommended
    if (imageFile.size > 5 * 1024 * 1024) {
       return NextResponse.json({ error: 'Image must be smaller than 5MB' }, { status: 400 });
    }

    // Generate unique filenames
    const fileUuid = uuidv4();
    const originalExt = imageFile.name.split('.').pop() || 'jpg'; // Keep original for sharp
    const tempFilePath = path.join(UPLOAD_DIR, `${fileUuid}-original.${originalExt}`);
    const processedFilePath = path.join(UPLOAD_DIR, `${fileUuid}.jpg`); // Output as JPG

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
          fit: 'cover', // Use 'cover' or 'contain' depending on desired cropping/fitting
          withoutEnlargement: true
        })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(processedFilePath);

      // Upload to B2 storage - Use a dedicated path for opportunities
      const fileName = `opportunity-images/${fileUuid}.jpg`; // B2 path
      const imageUrl = await b2Storage.uploadFile({
        filePath: processedFilePath,
        fileName: fileName,
        contentType: 'image/jpeg'
      });

      // IMPORTANT: Only return the URL. The opportunity itself isn't updated here.
      // The URL will be saved when the main opportunity form is submitted.

      // Clean up temporary files immediately after successful upload
      await Promise.all(tempFilePaths.map(async (filePath) => {
        if (existsSync(filePath)) {
          try {
            await unlink(filePath);
          } catch (err) {
            console.error(`Failed to delete temp file ${filePath}:`, err);
          }
        }
      }));
      tempFilePaths.length = 0; // Clear the array after successful cleanup

      return NextResponse.json({
        imageUrl,
        success: true
      });

    } catch (error) {
      console.error('Error processing or uploading opportunity image:', error);
      // Ensure cleanup even if processing/upload fails within the inner try
      await Promise.all(tempFilePaths.map(async (filePath) => {
         if (existsSync(filePath)) {
            try { await unlink(filePath); } catch (err) { console.error(`Cleanup Error (Inner Catch): Failed to delete temp file ${filePath}:`, err); }
         }
      }));
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error handling opportunity image upload request:', error);

    // General cleanup (finalizer) if something went wrong before the inner try-catch
    if (tempFilePaths.length > 0) {
        await Promise.all(tempFilePaths.map(async (filePath) => {
           if (existsSync(filePath)) {
              try { await unlink(filePath); console.log(`Cleanup: Deleted temp file: ${filePath}`); } catch (err) { console.error(`Cleanup: Failed to delete temp file ${filePath}:`, err); }
           }
        }));
    }

    // Handle specific errors if needed (e.g., auth errors already handled)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      error: 'Failed to upload image'
    }, {
      status: 500
    });
  }
}