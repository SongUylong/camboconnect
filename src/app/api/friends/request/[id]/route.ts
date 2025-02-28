import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface ParamsType {
  params: {
    id: string;
  };
}

export async function PUT(req: Request, { params }: ParamsType) {
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
    const { status } = body;
    
    // Validate status
    if (!status || !['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACCEPTED or DECLINED' },
        { status: 400 }
      );
    }
    
    // Find the friend request
    const friendRequest = await db.friendRequest.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }
    
    // Verify that the current user is the receiver of the request
    if (friendRequest.receiverId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to respond to this friend request' },
        { status: 403 }
      );
    }
    
    // Update the friend request status
    await db.friendRequest.update({
      where: { id },
      data: { status },
    });
    
    if (status === 'ACCEPTED') {
      // Create friendship entries (bidirectional)
      await db.friendship.createMany({
        data: [
          { userId: friendRequest.senderId, friendId: friendRequest.receiverId },
          { userId: friendRequest.receiverId, friendId: friendRequest.senderId },
        ],
      });
      
      // Create notifications for both users
      await db.notification.createMany({
        data: [
          {
            userId: friendRequest.senderId,
            type: 'FRIEND_REQUEST',
            message: `${friendRequest.receiver.firstName} ${friendRequest.receiver.lastName} accepted your friend request`,
            relatedEntityId: friendRequest.receiverId,
          },
          {
            userId: friendRequest.receiverId,
            type: 'FRIEND_REQUEST',
            message: `You and ${friendRequest.sender.firstName} ${friendRequest.sender.lastName} are now friends`,
            relatedEntityId: friendRequest.senderId,
          },
        ],
      });
      
      return NextResponse.json({
        message: 'Friend request accepted',
        friendship: true,
      });
    } else {
      // Create notification only for sender
      await db.notification.create({
        data: {
          userId: friendRequest.senderId,
          type: 'FRIEND_REQUEST',
          message: `${friendRequest.receiver.firstName} ${friendRequest.receiver.lastName} declined your friend request`,
          relatedEntityId: friendRequest.receiverId,
        },
      });
      
      return NextResponse.json({
        message: 'Friend request declined',
      });
    }
  } catch (error) {
    console.error('Error responding to friend request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}