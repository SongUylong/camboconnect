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

    // Get user data from request body
    const { name } = await req.json();

    // Validate name
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Split the full name into firstName and lastName
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Update user in database
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { 
        firstName,
        lastName 
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if the user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if force delete is requested
    const url = new URL(req.url);
    const forceDelete = url.searchParams.get("force") === "true";

    // If force delete is true, delete the user with all related records
    if (forceDelete) {
      // Using a transaction to ensure data consistency
      await db.$transaction(async (tx) => {
        // Delete all related records first to avoid foreign key constraints

        // Delete user's education entries
        await tx.education.deleteMany({
          where: { userId },
        });

        // Delete user's experience entries
        await tx.experience.deleteMany({
          where: { userId },
        });

        // Delete user's skill entries
        await tx.skill.deleteMany({
          where: { userId },
        });

        // Delete user's social links
        await tx.socialLink.deleteMany({
          where: { userId },
        });

        // Delete user's bookmarks
        await tx.bookmark.deleteMany({
          where: { userId },
        });

        // Delete user's applications
        await tx.application.deleteMany({
          where: { userId },
        });

        // Delete user's notifications
        await tx.notification.deleteMany({
          where: { userId },
        });

        // Delete user's follows
        await tx.follow.deleteMany({
          where: { userId },
        });

        // Delete friend requests sent by user
        await tx.friendRequest.deleteMany({
          where: { senderId: userId },
        });

        // Delete friend requests received by user
        await tx.friendRequest.deleteMany({
          where: { receiverId: userId },
        });

        // Delete user's friendships
        await tx.friendship.deleteMany({
          where: { 
            OR: [
              { userId },
              { friendId: userId }
            ]
          },
        });

        // Delete user's participations
        await tx.participation.deleteMany({
          where: { userId },
        });

        // Delete user's page views
        await tx.pageView.deleteMany({
          where: { userId },
        });

        // Delete user's event logs
        await tx.eventLog.deleteMany({
          where: { userId },
        });

        // Delete user's password reset token if exists
        await tx.passwordResetToken.deleteMany({
          where: { userId },
        });

        // Delete user's two factor token if exists
        await tx.twoFactorToken.deleteMany({
          where: { userId },
        });

        // Delete user's sessions
        await tx.session.deleteMany({
          where: { userId },
        });

        // Delete user's accounts (OAuth)
        await tx.account.deleteMany({
          where: { userId },
        });

        // Finally delete the user
        await tx.user.delete({
          where: { id: userId },
        });
      });

      return NextResponse.json({
        message: "User deleted successfully with all related data",
      });
    } else {
      // If not force delete, return error suggesting to use force delete
      return NextResponse.json(
        { error: "Please use force delete to remove users with related data" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}