import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface ParamsType {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: ParamsType) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { id } = params;
    
    // Get the user profile
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        bio: true,
        privacyLevel: true,
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if they are friends
    const friendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: id },
          { userId: id, friendId: userId }
        ]
      }
    });

    // Check if there's a pending friend request
    const pendingRequest = await db.friendRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: id,
        status: "PENDING"
      }
    });

    // Add friendship status to the response
    const response = {
      ...user,
      isFriend: !!friendship,
      hasPendingRequest: !!pendingRequest
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
} 