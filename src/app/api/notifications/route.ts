import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
    
    // Get query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unread') === 'true';
    
    // Build query
    const where = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };
    
    // Fetch notifications
    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    // Get unread count
    const unreadCount = await db.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    
    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
    const body = await req.json();
    
    // Mark all as read
    if (body.markAllAsRead) {
      await db.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
      
      return NextResponse.json({
        message: 'All notifications marked as read',
      });
    }
    
    // Mark specific notification as read
    if (body.notificationId && body.isRead !== undefined) {
      const notification = await db.notification.findFirst({
        where: {
          id: body.notificationId,
          userId,
        },
      });
      
      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
      
      await db.notification.update({
        where: {
          id: body.notificationId,
        },
        data: {
          isRead: body.isRead,
        },
      });
      
      return NextResponse.json({
        message: body.isRead 
          ? 'Notification marked as read' 
          : 'Notification marked as unread',
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}