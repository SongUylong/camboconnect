import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface ParamsType {
  params: {
    id: string;
  };
}

export async function POST(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { bookmarked } = body;
    
    // Check if opportunity exists
    const opportunity = await db.opportunity.findUnique({
      where: { id },
    });
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }
    
    // Check if bookmark exists
    const existingBookmark = await db.bookmark.findFirst({
      where: {
        userId,
        opportunityId: id,
      },
    });
    
    if (bookmarked) {
      // Create bookmark if it doesn't exist
      if (!existingBookmark) {
        await db.bookmark.create({
          data: {
            userId,
            opportunityId: id,
          },
        });
      }
      
      return NextResponse.json({
        bookmarked: true,
        message: 'Opportunity bookmarked successfully',
      });
    } else {
      // Remove bookmark if it exists
      if (existingBookmark) {
        await db.bookmark.delete({
          where: {
            id: existingBookmark.id,
          },
        });
      }
      
      return NextResponse.json({
        bookmarked: false,
        message: 'Opportunity removed from bookmarks',
      });
    }
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}