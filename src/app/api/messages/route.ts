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
    
    // Get all conversations for this user
    const conversations = await db.conversation.findMany({
      where: {
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
                profileImage: true,
              },
            },
            lastReadMessage: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    // Transform for the frontend
    const transformedConversations = conversations.map((conversation) => {
      // Get the other participants (excluding current user)
      const otherParticipants = conversation.participants.filter(
        (p) => p.userId !== userId
      );
      
      // Get the current user's participant record
      const userParticipant = conversation.participants.find(
        (p) => p.userId === userId
      );
      
      // Get the last message
      const lastMessage = conversation.messages[0];
      
      // Calculate unread count
      const userLastReadTime = userParticipant?.lastReadMessage?.createdAt || new Date(0);
      
      const unreadCount = lastMessage && lastMessage.createdAt > userLastReadTime 
        ? 1 // This is just an approximation as we're only fetching 1 message
        : 0;
      
      return {
        id: conversation.id,
        participants: otherParticipants.map((p) => p.user),
        lastMessage: lastMessage,
        unreadCount,
        updatedAt: conversation.updatedAt,
        messageCount: conversation._count.messages,
      };
    });
    
    return NextResponse.json(transformedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
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
    const { recipientId, message } = body;
    
    // Validate required fields
    if (!recipientId || !message) {
      return NextResponse.json(
        { error: 'Recipient ID and message are required' },
        { status: 400 }
      );
    }
    
    // Check if recipient exists
    const recipient = await db.user.findUnique({
      where: { id: recipientId },
    });
    
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }
    
    // Check if a conversation already exists between these users
    const existingConversation = await db.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: recipientId,
              },
            },
          },
        ],
      },
      include: {
        participants: true,
      },
    });
    
    let conversation;
    let newMessage;
    
    if (existingConversation) {
      // Use existing conversation
      conversation = existingConversation;
      
      // Create new message
      newMessage = await db.message.create({
        data: {
          content: message,
          senderId: userId,
          conversationId: conversation.id,
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
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    } else {
      // Create new conversation
      conversation = await db.conversation.create({
        data: {
          participants: {
            create: [
              { userId },
              { userId: recipientId },
            ],
          },
        },
      });
      
      // Create new message
      newMessage = await db.message.create({
        data: {
          content: message,
          senderId: userId,
          conversationId: conversation.id,
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
    }
    
    // Create notification for recipient
    await db.notification.create({
      data: {
        userId: recipientId,
        type: 'NEW_MESSAGE',
        message: `New message from ${session.user.name}`,
        relatedEntityId: conversation.id,
      },
    });
    
    return NextResponse.json({
      conversation: {
        id: conversation.id,
        message: newMessage,
      },
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}