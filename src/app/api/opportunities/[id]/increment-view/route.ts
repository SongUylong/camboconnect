import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/opportunities/[id]/increment-view
 * 
 * Increments the view count for a specific opportunity.
 * Used to track popularity of opportunities based on user views.
 * Only counts one view per user per opportunity.
 * 
 * URL Parameters:
 * - id: Opportunity ID
 * 
 * Returns:
 * - message: Success message
 * - viewed: Boolean indicating if this was a new view or already viewed
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
    
    // If the user has already viewed this opportunity, don't increment the count
    if (existingView) {
      return NextResponse.json({ 
        message: 'User has already viewed this opportunity',
        viewed: false
      });
    }
    
    // Create a record of this view in the event log
    await db.eventLog.create({
      data: {
        userId,
        entityId: id,
        entityType: 'opportunity',
        eventType: 'opportunity_view',
        sessionId: session.user.id, // Using userId as sessionId for simplicity
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    // Increment the view count by 1 in the database
    await db.opportunity.update({
      where: { id },
      data: { visitCount: { increment: 1 } },
    });

    return NextResponse.json({ 
      message: 'View count incremented successfully',
      viewed: true
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 