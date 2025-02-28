import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and admin status
    if (!session || !session.user.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'last30days';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // Calculate date range
    let startDate: Date;
    let endDate: Date = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case 'today':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'last7days':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last30days':
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
    }
    
    // Fetch daily stats
    const dailyStats = await db.dailyStats.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    // Fetch top opportunities
    const topOpportunities = await db.opportunity.findMany({
      where: {
        visitCount: {
          gt: 0,
        },
      },
      orderBy: {
        visitCount: 'desc',
      },
      take: 10,
      select: {
        id: true,
        title: true,
        visitCount: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });
    
    // Count page views by device type
    const deviceStats = await db.pageView.groupBy({
      by: ['device'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });
    
    // Count total users
    const totalUsers = await db.user.count();
    
    // Count new users in period
    const newUsers = await db.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    
    // Count total opportunities
    const totalOpportunities = await db.opportunity.count();
    
    // Count applications in period
    const applications = await db.application.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    
    // Aggregate the data
    const totalPageViews = dailyStats.reduce((sum, day) => sum + day.pageViews, 0);
    const totalUniqueVisitors = dailyStats.reduce((sum, day) => sum + day.uniqueVisitors, 0);
    
    // Format device stats
    const devices = deviceStats.reduce((acc, item) => {
      acc[item.device || 'unknown'] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      periodStart: startDate,
      periodEnd: endDate,
      overview: {
        pageViews: totalPageViews,
        uniqueVisitors: totalUniqueVisitors,
        newUsers,
        applications,
        totalUsers,
        totalOpportunities,
      },
      dailyStats,
      topOpportunities,
      devices,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}