import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Interface for route parameters
 * Contains the opportunity ID from the URL path
 */
interface ParamsType {
  params: {
    id: string;
  };
}

/**
 * POST /api/opportunities/[id]/bookmark
 * 
 * Toggles the bookmark status of an opportunity for the current user.
 * Creates a bookmark if bookmarked=true, removes it if bookmarked=false.
 * 
 * URL Parameters:
 * - id: Opportunity ID
 * 
 * Request Body:
 * - bookmarked: Boolean indicating whether to bookmark (true) or unbookmark (false)
 * 
 * Returns:
 * - bookmarked: Current bookmark status
 * - message: Success message
 * 
 * Authentication:
 * - Requires user to be logged in
 */
export async function POST(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication - only logged in users can bookmark
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { bookmarked } = body;
    
    // Verify that the opportunity exists
    const opportunity = await db.opportunity.findUnique({
      where: { id },
    });
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }
    
    // Check if the user has already bookmarked this opportunity
    const existingBookmark = await db.bookmark.findFirst({
      where: {
        userId,
        opportunityId: id,
      },
    });
    
    if (bookmarked) {
      // Add bookmark if it doesn't already exist
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