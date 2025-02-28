import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface ParamsType {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
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
    const before = searchParams.get('before');
    
    // Check if user is a participant in this conversation
    const participant = await db.conversationParticipant.findFirst({
      where: {
        userId,
        conversationId: id,
      },
    });
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Conversation not found or you are not a participant' },
        { status: 404 }
      );
    }
    
    // Build query
    const where = {
      conversationId: id,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    };
    
    // Fetch messages
    const messages = await db.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    
    // Fetch conversation details
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });
    
    // Mark messages as read
    if (messages.length > 0 && participant) {
      const latestMessage = messages.reduce((latest, message) => {
        return latest.createdAt > message.createdAt ? latest : message;
      });
      
      await db.conversationParticipant.update({
        where: { id: participant.id },
        data: {
          lastReadMessageId: latestMessage.id,
        },
      });
    }
    
    // Transform conversation for frontend
    const otherParticipants = conversation.participants
      .filter(p => p.userId !== userId)
      .map(p => p.user);
    
    return NextResponse.json({
      conversation: {
        id: conversation.id,
        participants: otherParticipants,
      },
      messages: messages.reverse(), // Return in chronological order
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
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
    const { message } = body;
    
    // Validate message
    if (!message) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    // Check if user is a participant in this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or you are not a participant' },
        { status: 404 }
      );
    }
    
    // Create new message
    const newMessage = await db.message.create({
      data: {
        content: message,
        senderId: userId,
        conversationId: id,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });
    
    // Update conversation updatedAt
    await db.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
    
    // Create notifications for other participants
    const otherParticipants = conversation.participants.filter(p => p.userId !== userId);
    
    for (const participant of otherParticipants) {
      await db.notification.create({
        data: {
          userId: participant.userId,
          type: 'NEW_MESSAGE',
          message: `New message from ${session.user.name}`,
          relatedEntityId: id,
        },
      });
    }
    
    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}