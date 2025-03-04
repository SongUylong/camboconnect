import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all applications for the user where isConfirm is false
    const applications = await db.application.findMany({
      where: {
        userId: session.user.id,
        status: {
          isConfirm: false
        }
      },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching unconfirmed applications:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 