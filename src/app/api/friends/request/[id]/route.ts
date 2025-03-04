import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function PUT(req: Request, { params }: ParamsType) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check if friend request exists and user is the receiver
    const friendRequest = await db.friendRequest.findUnique({
      where: {
        id,
      },
      include: {
        sender: {
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

    if (friendRequest.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update friend request status
    const updatedRequest = await db.friendRequest.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    // If accepted, create friendship
    if (status === 'ACCEPTED') {
      await db.friendship.create({
        data: {
          userId: friendRequest.senderId,
          friendId: friendRequest.receiverId,
        },
      });

      // Create notification for sender
      await db.notification.create({
        data: {
          userId: friendRequest.senderId,
          type: 'FRIEND_REQUEST',
          message: `${session.user.firstName} ${session.user.lastName} accepted your friend request`,
          relatedEntityId: friendRequest.id,
        },
      });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating friend request:', error);
    return NextResponse.json(
      { error: 'Failed to update friend request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: ParamsType) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if friend request exists and user is involved
    const friendRequest = await db.friendRequest.findUnique({
      where: {
        id,
      },
    });

    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    if (friendRequest.senderId !== session.user.id && friendRequest.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete friend request
    await db.friendRequest.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Friend request deleted successfully' });
  } catch (error) {
    console.error('Error deleting friend request:', error);
    return NextResponse.json(
      { error: 'Failed to delete friend request' },
      { status: 500 }
    );
  }
}