import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { FriendRequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

// GET /api/friends/requests - Get all friend requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Fetch all pending friend requests received by the user
    const requests = await db.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: FriendRequestStatus.PENDING
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch friend requests" },
      { status: 500 }
    );
  }
}

// POST /api/friends/requests - Send a friend request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { receiverId } = await req.json();
    
    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }
    
    // Check if user is trying to send request to themselves
    if (userId === receiverId) {
      return NextResponse.json(
        { error: "Cannot send friend request to yourself" },
        { status: 400 }
      );
    }
    
    // Check if friend request already exists
    const existingRequest = await db.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId }
        ]
      }
    });
    
    if (existingRequest) {
      return NextResponse.json(
        { error: "Friend request already exists" },
        { status: 400 }
      );
    }
    
    // Check if they are already friends
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: receiverId },
          { userId: receiverId, friendId: userId }
        ]
      }
    });
    
    if (existingFriendship) {
      return NextResponse.json(
        { error: "Already friends" },
        { status: 400 }
      );
    }
    
    // Get sender's info for notification
    const sender = await db.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true
      }
    });
    
    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 400 }
      );
    }
    
    // Get receiver's info for sender's notification
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      select: {
        firstName: true,
        lastName: true
      }
    });
    
    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 400 }
      );
    }
    
    // Create friend request
    const friendRequest = await db.friendRequest.create({
      data: {
        senderId: userId,
        receiverId,
        status: FriendRequestStatus.PENDING
      }
    });
    
    // Create notification with sender's name
    await createNotification({
      userId: receiverId,
      type: "FRIEND_REQUEST",
      message: `${sender.firstName} ${sender.lastName} sent you a friend request`,
      relatedEntityId: friendRequest.id
    });
    
    // Send notification to sender as well (optional)
    await createNotification({
      userId: userId,
      type: "FRIEND_REQUEST",
      message: `You sent a friend request to ${receiver.firstName} ${receiver.lastName}`,
      relatedEntityId: friendRequest.id
    });
    
    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Failed to send friend request" },
      { status: 500 }
    );
  }
} 