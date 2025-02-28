import { db } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Anonymous session tracking
export const getSessionId = () => {
  const cookieStore = cookies();
  let sessionId = cookieStore.get('analytics_session')?.value;
  
  if (!sessionId) {
    sessionId = nanoid();
    // In a server action, you would set the cookie here
  }
  
  return sessionId;
};

// Track page view
export const trackPageView = async (path: string, referrer?: string, userAgent?: string) => {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const sessionId = getSessionId();
    
    // Determine device type from user agent
    let device = 'unknown';
    if (userAgent) {
      if (/mobile/i.test(userAgent)) {
        device = 'mobile';
      } else if (/tablet/i.test(userAgent)) {
        device = 'tablet';
      } else if (/windows|macintosh|linux/i.test(userAgent)) {
        device = 'desktop';
      }
    }
    
    // Record page view
    await db.pageView.create({
      data: {
        path,
        userId,
        sessionId,
        referrer,
        userAgent,
        device,
      },
    });
    
    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await db.dailyStats.upsert({
      where: { date: today },
      update: {
        pageViews: { increment: 1 },
        // Note: We'd need a separate job to calculate unique visitors accurately
      },
      create: {
        date: today,
        pageViews: 1,
        uniqueVisitors: 1,
        newUsers: 0,
        applications: 0,
        bookmarks: 0,
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return false;
  }
};

// Track user event
export const trackEvent = async (
  eventType: string,
  entityId?: string,
  entityType?: string,
  metadata?: any
) => {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const sessionId = getSessionId();
    
    // Record event
    await db.eventLog.create({
      data: {
        eventType,
        userId,
        sessionId,
        entityId,
        entityType,
        metadata,
      },
    });
    
    // Update daily stats based on event type
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updateData: any = {};
    
    if (eventType === 'application_submit') {
      updateData.applications = { increment: 1 };
    } else if (eventType === 'bookmark_add') {
      updateData.bookmarks = { increment: 1 };
    } else if (eventType === 'user_register') {
      updateData.newUsers = { increment: 1 };
    } else if (eventType === 'opportunity_view' && entityId) {
      updateData.opportunityViews = await updateJsonCounter(today, 'opportunityViews', entityId);
    } else if (eventType === 'category_view' && entityId) {
      updateData.categoryViews = await updateJsonCounter(today, 'categoryViews', entityId);
    }
    
    if (Object.keys(updateData).length > 0) {
      await db.dailyStats.upsert({
        where: { date: today },
        update: updateData,
        create: {
          date: today,
          pageViews: 0,
          uniqueVisitors: 0,
          newUsers: eventType === 'user_register' ? 1 : 0,
          applications: eventType === 'application_submit' ? 1 : 0,
          bookmarks: eventType === 'bookmark_add' ? 1 : 0,
          ...(eventType === 'opportunity_view' && entityId
            ? { opportunityViews: { [entityId]: 1 } }
            : {}),
          ...(eventType === 'category_view' && entityId
            ? { categoryViews: { [entityId]: 1 } }
            : {}),
        },
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking event:', error);
    return false;
  }
};

// Helper function to update counters stored in JSON fields
async function updateJsonCounter(date: Date, field: string, id: string) {
  const stats = await db.dailyStats.findUnique({
    where: { date },
    select: { [field]: true },
  });
  
  const counters = stats?.[field] as Record<string, number> || {};
  return { ...counters, [id]: (counters[id] || 0) + 1 };
}