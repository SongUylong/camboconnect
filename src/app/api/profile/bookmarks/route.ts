import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Fetch user's bookmarks with opportunity details
    const bookmarks = await db.bookmark.findMany({
      where: {
        userId,
      },
      include: {
        opportunity: {
          include: {
            organization: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Transform the data for the frontend
    const transformedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.opportunity.id,
      bookmarkId: bookmark.id,
      title: bookmark.opportunity.title,
      shortDescription: bookmark.opportunity.shortDescription,
      deadline: bookmark.opportunity.deadline,
      status: bookmark.opportunity.status,
      visitCount: bookmark.opportunity.visitCount,
      isPopular: bookmark.opportunity.isPopular,
      isNew: bookmark.opportunity.isNew,
      organization: {
        id: bookmark.opportunity.organization.id,
        name: bookmark.opportunity.organization.name,
        logo: bookmark.opportunity.organization.logo,
      },
      category: {
        id: bookmark.opportunity.category.id,
        name: bookmark.opportunity.category.name,
      },
      isBookmarked: true, // Since this is from bookmarks, it's always true
      bookmarkedAt: bookmark.createdAt,
    }));
    
    return NextResponse.json(transformedBookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 