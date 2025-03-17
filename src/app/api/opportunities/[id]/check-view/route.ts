import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/opportunities/[id]/check-view
 * 
 * Checks if the current user has already viewed a specific opportunity.
 * Used to prevent duplicate view counts and to determine if a view should be counted.
 * 
 * URL Parameters:
 * - id: Opportunity ID
 * 
 * Returns:
 * - hasViewed: Boolean indicating if the user has already viewed this opportunity
 * - viewedAt: Timestamp of when the user viewed the opportunity (if applicable)
 * 
 * Authentication:
 * - Requires user to be logged in
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const userId = session.user.id;
    
    // Check if this user has already viewed this opportunity by looking for an event log
    const existingView = await db.eventLog.findFirst({
      where: {
        userId,
        entityId: id,
        entityType: 'opportunity',
        eventType: 'opportunity_view',
      },
    });
    
    return NextResponse.json({
      hasViewed: !!existingView,
      viewedAt: existingView ? existingView.createdAt : null
    });
  } catch (error) {
    console.error('Error checking view status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 