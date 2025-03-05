import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PrivacyLevel } from "@prisma/client";

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
    
    // Check if they are friends
    const friendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: id },
          { userId: id, friendId: userId }
        ]
      }
    });

    const isSelf = userId === id;
    const isFriend = !!friendship;
    
    // Fetch participations based on privacy settings
    const participations = await db.participation.findMany({
      where: {
        userId: id,
        OR: [
          { privacyLevel: PrivacyLevel.PUBLIC },
          { userId: isSelf ? userId : undefined },
          { privacyLevel: isFriend ? PrivacyLevel.FRIENDS_ONLY : undefined }
        ]
      },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            organization: {
              select: {
                id: true,
                name: true,
                logo: true,
              }
            },
            participations: {
              where: {
                OR: [
                  { privacyLevel: PrivacyLevel.PUBLIC },
                  { userId: isSelf ? userId : undefined },
                  { privacyLevel: isFriend ? PrivacyLevel.FRIENDS_ONLY : undefined }
                ]
              },
              select: {
                id: true,
                year: true,
                privacyLevel: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    privacyLevel: true,
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            privacyLevel: true,
          }
        }
      },
      orderBy: {
        year: 'desc'
      }
    });
    
    return NextResponse.json({ participations });
  } catch (error) {
    console.error("Error fetching user participations:", error);
    return NextResponse.json(
      { error: "Failed to fetch user participations" },
      { status: 500 }
    );
  }
}