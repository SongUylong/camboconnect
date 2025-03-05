import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/friends - Get all friends
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
    
    // Fetch all friendships where the user is either the user or the friend
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
            bio: true,
          }
        },
        friend: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
            bio: true,
          }
        }
      }
    });
    
    // Transform the data to return the friend's information
    const friends = friendships.map((friendship) => {
      // If the user is the 'user' in the friendship, return the 'friend' data
      // If the user is the 'friend' in the friendship, return the 'user' data
      const friendData = friendship.userId === userId ? friendship.friend : friendship.user;
      
      return {
        id: friendData.id,
        firstName: friendData.firstName,
        lastName: friendData.lastName,
        email: friendData.email,
        profileImage: friendData.profileImage,
        bio: friendData.bio,
      };
    });
    
    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

// POST /api/friends - Send a friend request
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
    const { friendId } = await req.json();
    
    if (!friendId) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 }
      );
    }
    
    // Check if user is trying to add themselves
    if (userId === friendId) {
      return NextResponse.json(
        { error: "You cannot add yourself as a friend" },
        { status: 400 }
      );
    }
    
    // Check if friendship already exists
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
    
    if (existingFriendship) {
      return NextResponse.json(
        { error: "Friendship already exists" },
        { status: 400 }
      );
    }
    
    // Create friend request
    const friendRequest = await db.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: friendId,
        status: "PENDING",
      },
    });
    
    // Create notification for the receiver
    await db.notification.create({
      data: {
        userId: friendId,
        type: "FRIEND_REQUEST",
        message: `You have a new friend request`,
        isRead: false
      },
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

// DELETE /api/friends?friendId=xxx - Remove a friend
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const friendId = url.searchParams.get("friendId");
    
    if (!friendId) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 }
      );
    }
    
    // Delete the friendship
    await db.friendship.deleteMany({
      where: {
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error);
    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
}
