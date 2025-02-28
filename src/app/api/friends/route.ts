import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/friends - Get all friends/connections
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "accepted"; // pending, accepted, all
    
    // Build the query based on status
    let query = {};
    
    if (status === "pending") {
      // Get pending friend requests (received)
      query = {
        receiverId: userId,
        status: "PENDING",
      };
    } else if (status === "sent") {
      // Get sent friend requests
      query = {
        senderId: userId,
        status: "PENDING",
      };
    } else if (status === "accepted") {
      // Get accepted connections (friends)
      query = {
        OR: [
          { senderId: userId, status: "ACCEPTED" },
          { receiverId: userId, status: "ACCEPTED" },
        ],
      };
    } else if (status === "all") {
      // Get all connections regardless of status
      query = {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      };
    }
    
    // Fetch connections with user details
    const connections = await db.connection.findMany({
      where: query,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            location: true,
            company: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            location: true,
            company: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    
    // Transform the data to return the other user in each connection
    const friends = connections.map((connection) => {
      const isSender = connection.senderId === userId;
      const otherUser = isSender ? connection.receiver : connection.sender;
      
      return {
        connectionId: connection.id,
        status: connection.status,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        user: otherUser,
        isSender,
      };
    });
    
    return NextResponse.json(friends);
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
    const { receiverId } = await req.json();
    
    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }
    
    // Check if user is trying to add themselves
    if (userId === receiverId) {
      return NextResponse.json(
        { error: "You cannot add yourself as a friend" },
        { status: 400 }
      );
    }
    
    // Check if connection already exists
    const existingConnection = await db.connection.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
      },
    });
    
    if (existingConnection) {
      return NextResponse.json(
        { error: "Connection already exists", status: existingConnection.status },
        { status: 400 }
      );
    }
    
    // Create new connection (friend request)
    const newConnection = await db.connection.create({
      data: {
        senderId: userId,
        receiverId,
        status: "PENDING",
      },
    });
    
    // Create notification for the receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: "FRIEND_REQUEST",
        message: `You have a new connection request`,
        actorId: userId,
        read: false,
      },
    });
    
    return NextResponse.json(newConnection);
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Failed to send friend request" },
      { status: 500 }
    );
  }
}

// PATCH /api/friends - Accept or reject a friend request
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { connectionId, action } = await req.json();
    
    if (!connectionId || !action) {
      return NextResponse.json(
        { error: "Connection ID and action are required" },
        { status: 400 }
      );
    }
    
    // Verify the connection exists and user is the receiver
    const connection = await db.connection.findUnique({
      where: { id: connectionId },
      include: { sender: { select: { id: true, name: true } } },
    });
    
    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the receiver of the request
    if (connection.receiverId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action" },
        { status: 403 }
      );
    }
    
    // Check if the connection is already accepted or rejected
    if (connection.status !== "PENDING") {
      return NextResponse.json(
        { error: `Connection is already ${connection.status.toLowerCase()}` },
        { status: 400 }
      );
    }
    
    // Update connection status based on action
    let status;
    if (action === "accept") {
      status = "ACCEPTED";
    } else if (action === "reject") {
      status = "REJECTED";
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }
    
    // Update the connection
    const updatedConnection = await db.connection.update({
      where: { id: connectionId },
      data: { status },
    });
    
    // Create notification for the sender
    if (status === "ACCEPTED") {
      await db.notification.create({
        data: {
          userId: connection.senderId,
          type: "FRIEND_ACCEPTED",
          message: `Your connection request was accepted`,
          actorId: userId,
          read: false,
        },
      });
    }
    
    return NextResponse.json(updatedConnection);
  } catch (error) {
    console.error("Error updating friend request:", error);
    return NextResponse.json(
      { error: "Failed to update friend request" },
      { status: 500 }
    );
  }
}

// DELETE /api/friends - Remove a connection
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
    const connectionId = url.searchParams.get("connectionId");
    
    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 }
      );
    }
    
    // Verify the connection exists and user is part of it
    const connection = await db.connection.findUnique({
      where: { id: connectionId },
    });
    
    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }
    
    // Check if user is part of the connection
    if (connection.senderId !== userId && connection.receiverId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action" },
        { status: 403 }
      );
    }
    
    // Delete the connection
    await db.connection.delete({
      where: { id: connectionId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing connection:", error);
    return NextResponse.json(
      { error: "Failed to remove connection" },
      { status: 500 }
    );
  }
}
