import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/profile/viewed-opportunities
 * 
 * Fetches a list of opportunities that the current user has viewed.
 * Uses the EventLog table to track view history.
 * 
 * Query Parameters:
 * - limit: Maximum number of items to return (default: 10)
 * - page: Page number for pagination (default: 1)
 * 
 * Returns:
 * - opportunities: Array of viewed opportunities with details
 * - totalCount: Total number of viewed opportunities
 * - pageCount: Total number of pages
 * 
 * Authentication:
 * - Requires user to be logged in
 */
export async function GET(req: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await db.eventLog.count({
      where: {
        userId,
        eventType: 'opportunity_view',
        entityType: 'opportunity',
      },
    });
    
    // Calculate total pages
    const pageCount = Math.ceil(totalCount / limit);
    
    // Fetch viewed opportunities from EventLog
    const viewedOpportunityLogs = await db.eventLog.findMany({
      where: {
        userId,
        eventType: 'opportunity_view',
        entityType: 'opportunity',
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
    
    // Extract opportunity IDs
    const opportunityIds = viewedOpportunityLogs.map(log => log.entityId).filter(Boolean) as string[];
    
    // Fetch opportunity details
    const opportunities = await db.opportunity.findMany({
      where: {
        id: {
          in: opportunityIds,
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // Map opportunities with view timestamps
    const viewedOpportunities = opportunityIds.map(id => {
      const opportunity = opportunities.find(o => o.id === id);
      const log = viewedOpportunityLogs.find(l => l.entityId === id);
      
      if (!opportunity || !log) return null;
      
      return {
        id: opportunity.id,
        title: opportunity.title,
        viewedAt: log.createdAt,
        organization: opportunity.organization,
        category: opportunity.category,
      };
    }).filter(Boolean);
    
    return NextResponse.json({
      opportunities: viewedOpportunities,
      totalCount,
      pageCount,
    });
  } catch (error) {
    console.error('Error fetching viewed opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 