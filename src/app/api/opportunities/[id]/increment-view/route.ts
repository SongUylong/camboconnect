import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/opportunities/[id]/increment-view
 * 
 * Increments the view count for a specific opportunity.
 * Used to track popularity of opportunities based on user views.
 * 
 * URL Parameters:
 * - id: Opportunity ID
 * 
 * Returns:
 * - message: Success message
 * 
 * Authentication:
 * - Requires user to be logged in to prevent spam/bot views
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Verify user is authenticated to prevent spam views
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Increment the view count by 1 in the database
    await db.opportunity.update({
      where: { id },
      data: { visitCount: { increment: 1 } },
    });

    return NextResponse.json({ message: 'View count incremented successfully' });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 