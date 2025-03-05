import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { FriendRequestStatus } from "@prisma/client";

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
    
    // Get the friend request
    const friendRequest = await db.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
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
    await db.friendship.create({
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
    
    // Create notification for sender
    await db.notification.create({
      data: {
        userId: friendRequest.senderId,
        type: "FRIEND_REQUEST",
        message: `Your friend request was accepted`,
        isRead: false
      }
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

// DELETE /api/friends/requests/[requestId] - Decline a friend request
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
      where: { id: requestId }
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
        { error: "Not authorized to decline this request" },
        { status: 403 }
      );
    }
    
    // Update friend request status before deleting
    await db.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.DECLINED }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error declining friend request:", error);
    return NextResponse.json(
      { error: "Failed to decline friend request" },
      { status: 500 }
    );
  }
} 