import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

// CRON job to check for approaching deadlines and notify users
export async function POST(req: Request) {
  try {
    // Authenticate the CRON request - allow both authorization and Authorization headers
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const API_SECRET_KEY = process.env.CRON_API_SECRET;
    
    if (!authHeader || authHeader !== API_SECRET_KEY) {
      console.log('Unauthorized CRON job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Starting deadline check CRON job');
    
    // Get current date
    const now = new Date();
    
    // Calculate tomorrow's date (for deadlines approaching in next 24 hours)
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999); // End of tomorrow
    
    const today = new Date(now);
    today.setHours(0, 0, 0, 0); // Start of today
    
    console.log(`Checking for deadlines between ${today.toISOString()} and ${tomorrow.toISOString()}`);
    
    // First, check if there are any active opportunities with deadlines in this range
    const activeOpportunities = await db.opportunity.findMany({
      where: {
        deadline: {
          gte: today,
          lte: tomorrow,
        },
        status: {
          in: ['ACTIVE', 'CLOSING_SOON']
        }
      },
      select: {
        id: true,
        title: true,
        deadline: true
      }
    });
    
    console.log(`Found ${activeOpportunities.length} active opportunities with approaching deadlines:`);
    activeOpportunities.forEach(opp => {
      console.log(`- ID: ${opp.id}, Title: ${opp.title}, Deadline: ${new Date(opp.deadline).toISOString()}`);
    });
    
    if (activeOpportunities.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active opportunities with approaching deadlines",
        notificationsCreated: 0
      });
    }
    
    // Find bookmarked opportunities with approaching deadlines
    const bookmarkedOpportunities = await db.bookmark.findMany({
      where: {
        opportunity: {
          deadline: {
            gte: today,
            lte: tomorrow,
          },
          status: {
            in: ['ACTIVE', 'CLOSING_SOON']
          }
        },
      },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            deadline: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true
          }
        }
      }
    });
    
    console.log(`Found ${bookmarkedOpportunities.length} bookmarked opportunities with approaching deadlines`);
    
    if (bookmarkedOpportunities.length === 0) {
      console.log("No bookmarks found for opportunities with approaching deadlines");
      
      // Check if there are any bookmarks at all in the system
      const totalBookmarks = await db.bookmark.count();
      console.log(`Total bookmarks in the system: ${totalBookmarks}`);
      
      return NextResponse.json({
        success: true,
        message: "No bookmarked opportunities with approaching deadlines",
        activeOpportunities: activeOpportunities.length,
        notificationsCreated: 0
      });
    }
    
    // Create notifications for each user
    const notifications = [];
    for (const bookmark of bookmarkedOpportunities) {
      // Calculate hours remaining until deadline
      const deadlineDate = new Date(bookmark.opportunity.deadline);
      const hoursRemaining = Math.round((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      console.log(`Processing bookmark for user ${bookmark.user.id}, opportunity ${bookmark.opportunity.id}, ${hoursRemaining} hours remaining`);
      
      // Skip if user already has a reminder for this opportunity
      const existingNotification = await db.notification.findFirst({
        where: {
          userId: bookmark.user.id,
          relatedEntityId: bookmark.opportunity.id,
          type: 'DEADLINE_REMINDER',
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });
      
      if (!existingNotification) {
        // Create a more personalized message
        let message = '';
        if (hoursRemaining <= 24) {
          message = `URGENT: Less than 24 hours left to apply for "${bookmark.opportunity.title}"`;
        } else {
          message = `Reminder: Deadline approaching for "${bookmark.opportunity.title}"`;
        }
        
        console.log(`Creating notification for user ${bookmark.user.id} about opportunity ${bookmark.opportunity.id}`);
        
        try {
          const notification = await db.notification.create({
            data: {
              userId: bookmark.user.id,
              type: 'DEADLINE_REMINDER',
              message: message,
              relatedEntityId: bookmark.opportunity.id,
            }
          });
          notifications.push(notification);
          console.log(`Successfully created notification ID: ${notification.id}`);
        } catch (err) {
          console.error(`Failed to create notification: ${(err as Error).message}`);
        }
      } else {
        console.log(`Skipping notification for user ${bookmark.user.id} - already notified within last 24 hours`);
      }
    }
    
    return NextResponse.json({
      success: true,
      notificationsCreated: notifications.length,
      activeOpportunities: activeOpportunities.length,
      bookmarkedOpportunities: bookmarkedOpportunities.length,
      notificationsDetails: notifications.map(n => ({ 
        id: n.id,
        userId: n.userId, 
        opportunityId: n.relatedEntityId,
        message: n.message
      }))
    });
  } catch (error) {
    console.error('Error checking deadlines:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 