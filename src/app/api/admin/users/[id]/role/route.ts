import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user ID from params
    const userId = params.id;

    // Get role data from request body
    const { role } = await req.json();

    // Validate role value and convert to isAdmin boolean
    if (!["USER", "ADMIN", "ORGANIZATION"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }
    
    // Set isAdmin based on role
    const isAdmin = role === "ADMIN";

    // Update user role in database
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isAdmin },
    });

    return NextResponse.json({
      message: "User role updated successfully",
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        role: updatedUser.isAdmin ? "ADMIN" : "USER", // Convert back to role format for frontend
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}