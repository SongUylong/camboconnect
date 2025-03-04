import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await db.user.findUnique({
      where: {
        id: receiverId,
      },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Check if trying to send request to self
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if friend request already exists
    const existingRequest = await db.friendRequest.findFirst({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: session.user.id,
          },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Friend request already exists' },
        { status: 400 }
      );
    }

    // Check if already friends
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          {
            userId: session.user.id,
            friendId: receiverId,
          },
          {
            userId: receiverId,
            friendId: session.user.id,
          },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Already friends' },
        { status: 400 }
      );
    }

    // Create friend request
    const friendRequest = await db.friendRequest.create({
      data: {
        senderId: session.user.id,
        receiverId: receiverId,
        status: 'PENDING',
      },
    });

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'FRIEND_REQUEST',
        message: `${session.user.firstName} ${session.user.lastName} sent you a friend request`,
        relatedEntityId: friendRequest.id,
      },
    });

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
} 