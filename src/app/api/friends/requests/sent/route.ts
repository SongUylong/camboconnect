import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { FriendRequestStatus } from "@prisma/client";

// GET /api/friends/requests/sent - Get all friend requests sent by the user
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
    
    // Fetch all pending friend requests sent by the user
    const sentRequests = await db.friendRequest.findMany({
      where: {
        senderId: userId,
        status: FriendRequestStatus.PENDING
      },
      include: {
        receiver: {
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
    
    return NextResponse.json({ sentRequests });
  } catch (error) {
    console.error("Error fetching sent friend requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch sent friend requests" },
      { status: 500 }
    );
  }
} 