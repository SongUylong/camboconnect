import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { OpportunityStatus } from '@prisma/client';

// Secret key for authentication
const API_SECRET_KEY = process.env.CRON_API_SECRET;

export async function POST(req: Request) {
  try {
    // Debug: Log all headers
    console.log('Request headers:');
    const headerEntries = Array.from(req.headers.entries());
    console.log(JSON.stringify(headerEntries, null, 2));
    
    // Debug: Log API key from environment
    console.log('API_SECRET_KEY:', API_SECRET_KEY);
    
    // Debug: Log authorization header specifically
    const authHeader = req.headers.get('authorization');
    console.log('Authorization header:', authHeader);
    
    // Debug: Log comparison result
    console.log('Auth comparison result:', authHeader === API_SECRET_KEY);
    
    if (!authHeader || authHeader !== API_SECRET_KEY) {
      console.log('Authentication failed. Returning 401.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authentication successful. Proceeding with updates.');
    
    // Get current date for comparison
    const now = new Date();
    
    // Calculate reference dates
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    // 1. Update opportunities to ACTIVE if they've reached their start date
    const activeResult = await db.opportunity.updateMany({
      where: {
        status: OpportunityStatus.OPENING_SOON,
        startDate: {
          lte: now
        }
      },
      data: {
        status: OpportunityStatus.ACTIVE
      }
    });

    // 2. Update opportunities to CLOSING_SOON if deadline is within 3 days
    const closingSoonResult = await db.opportunity.updateMany({
      where: {
        status: OpportunityStatus.ACTIVE,
        deadline: {
          lte: threeDaysFromNow,
          gt: now
        }
      },
      data: {
        status: OpportunityStatus.CLOSING_SOON
      }
    });

    // 3. Update opportunities to CLOSED if deadline has passed
    const closedResult = await db.opportunity.updateMany({
      where: {
        status: {
          in: [OpportunityStatus.ACTIVE, OpportunityStatus.CLOSING_SOON]
        },
        deadline: {
          lte: now
        }
      },
      data: {
        status: OpportunityStatus.CLOSED
      }
    });

    // 4. Update isPopular flag for opportunities with visitCount >= 300
    const popularResult = await db.opportunity.updateMany({
      where: {
        visitCount: {
          gte: 300
        },
        isPopular: false
      },
      data: {
        isPopular: true
      }
    });

    // 5. Update isNew flag - set to false for opportunities older than 1 week
    const notNewResult = await db.opportunity.updateMany({
      where: {
        createdAt: {
          lt: oneWeekAgo
        },
        isNew: true
      },
      data: {
        isNew: false
      }
    });

    // Log the results
    console.log('Opportunity updates:', {
      active: activeResult.count,
      closingSoon: closingSoonResult.count,
      closed: closedResult.count,
      popular: popularResult.count,
      notNew: notNewResult.count,
      timestamp: now.toISOString()
    });

    return NextResponse.json({
      success: true,
      updated: {
        active: activeResult.count,
        closingSoon: closingSoonResult.count,
        closed: closedResult.count,
        popular: popularResult.count,
        notNew: notNewResult.count
      },
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error updating opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}