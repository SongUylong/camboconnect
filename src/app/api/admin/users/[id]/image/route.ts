import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from "uuid";
import sharp from 'sharp';
import b2Storage from '@/lib/b2storage';

// Directory for temporary file storage
const UPLOAD_DIR = path.join(process.cwd(), 'tmp/uploads');

// Image processing constants
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const JPEG_QUALITY = 80;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Track file paths for cleanup
  const tempFilePaths: string[] = [];
  
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user ID from params
    const userId = params.id;

    // Check if the user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Process the uploaded file
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File is not an image' }, { status: 400 });
    }

    // Generate unique filenames
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
      const fileName = `profile-images/admin-managed/${userId}-${fileUuid}.jpg`;
      const imageUrl = await b2Storage.uploadFile({
        filePath: processedFilePath,
        fileName: fileName,
        contentType: 'image/jpeg'
      });

      // Update user in database with new image URL
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { profileImage: imageUrl },
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
        message: "Profile image updated successfully",
        user: {
          id: updatedUser.id,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
          profileImage: updatedUser.profileImage,
        },
      });
    } catch (error) {
      console.error('Error processing image upload:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error("Error updating profile image:", error);
    
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
    
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}