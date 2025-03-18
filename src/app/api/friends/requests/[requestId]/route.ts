import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { FriendRequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

interface ParamsType {
  params: {
    requestId: string;
  };
}

// POST /api/friends/requests/[requestId] - Accept a friend request
export async function POST(req: NextRequest, { params }: ParamsType) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { requestId } = params;
    
    // Get the friend request with both sender and receiver details
    const friendRequest = await db.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    
    if (!friendRequest) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the receiver
    if (friendRequest.receiverId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to accept this request" },
        { status: 403 }
      );
    }
    
    // Check if request is still pending
    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      return NextResponse.json(
        { error: "Friend request is no longer pending" },
        { status: 400 }
      );
    }
    
    // Create friendship
    const friendship = await db.friendship.create({
      data: {
        userId: friendRequest.senderId,
        friendId: friendRequest.receiverId,
      }
    });
    
    // Update friend request status
    await db.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.ACCEPTED }
    });
    
    // Create notification for sender with receiver's name
    await createNotification({
      userId: friendRequest.senderId,
      type: "FRIEND_REQUEST",
      message: `${friendRequest.receiver.firstName} ${friendRequest.receiver.lastName} accepted your friend request`,
      relatedEntityId: friendship.id
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return NextResponse.json(
      { error: "Failed to accept friend request" },
      { status: 500 }
    );
  }
}

// DELETE /api/friends/requests/[requestId] - Decline a friend request or cancel a sent request
export async function DELETE(req: NextRequest, { params }: ParamsType) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { requestId } = params;
    
    // Get the friend request
    const friendRequest = await db.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        receiver: {
          select: {
            id: true,
          }
        },
        sender: {
          select: {
            id: true,
          }
        }
      }
    });
    
    if (!friendRequest) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the receiver (declining) or the sender (canceling)
    const isReceiver = friendRequest.receiverId === userId;
    const isSender = friendRequest.senderId === userId;
    
    if (!isReceiver && !isSender) {
      return NextResponse.json(
        { error: "Not authorized to perform this action" },
        { status: 403 }
      );
    }
    
    // Delete the friend request (instead of updating status)
    await db.friendRequest.delete({
      where: { id: requestId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error declining/canceling friend request:", error);
    return NextResponse.json(
      { error: "Failed to decline/cancel friend request" },
      { status: 500 }
    );
  }
} 