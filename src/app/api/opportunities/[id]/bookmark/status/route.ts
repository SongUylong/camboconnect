import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface ParamsType {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // If not authenticated, return false
    if (!session || !session.user.id) {
      return NextResponse.json({ isBookmarked: false });
    }
    
    const userId = session.user.id;
    
    // Check if bookmark exists
    const existingBookmark = await db.bookmark.findFirst({
      where: {
        userId,
        opportunityId: id,
      },
    });
    
    return NextResponse.json({
      isBookmarked: !!existingBookmark,
    });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return NextResponse.json(
      { error: 'Internal server error', isBookmarked: false },
      { status: 500 }
    );
  }
} 