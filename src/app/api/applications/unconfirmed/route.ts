import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { subMinutes } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current time minus 1 minute
    const oneMinuteAgo = subMinutes(new Date(), 1);

    // Find all unconfirmed applications for the user that are older than 1 minute
    const applications = await db.application.findMany({
      where: {
        userId: session.user.id,
        status: {
          isConfirm: false,
        },
        createdAt: {
          lt: oneMinuteAgo
        }
      },
      select: {
        id: true,
        opportunity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching unconfirmed applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 