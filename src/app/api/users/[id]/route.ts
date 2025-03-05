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
    
    // Get the user profile with all privacy settings
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
        educationPrivacy: true,
        experiencePrivacy: true,
        skillsPrivacy: true,
        contactUrlPrivacy: true,
        educationEntries: {
          select: {
            id: true,
            school: true,
            degree: true,
            field: true,
            startDate: true,
            endDate: true,
          },
        },
        experienceEntries: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            startDate: true,
            endDate: true,
            description: true,
          },
        },
        skillEntries: {
          select: {
            id: true,
            name: true,
          },
        },
        socialLinks: {
          select: {
            id: true,
            platform: true,
            url: true,
          },
        },
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

    // Determine what information to share based on privacy settings and relationship
    const isSelf = userId === id;
    const isFriend = !!friendship;
    const canViewPrivateInfo = isSelf || isFriend;

    // Filter information based on privacy settings
    const filteredProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: canViewPrivateInfo || user.privacyLevel === PrivacyLevel.PUBLIC ? user.email : null,
      profileImage: user.profileImage,
      bio: canViewPrivateInfo || user.privacyLevel === PrivacyLevel.PUBLIC ? user.bio : null,
      privacyLevel: user.privacyLevel,
      isFriend,
      hasPendingRequest: !!pendingRequest,
      education: canViewPrivateInfo || user.educationPrivacy === PrivacyLevel.PUBLIC 
        ? user.educationEntries 
        : [],
      experience: canViewPrivateInfo || user.experiencePrivacy === PrivacyLevel.PUBLIC 
        ? user.experienceEntries 
        : [],
      skills: canViewPrivateInfo || user.skillsPrivacy === PrivacyLevel.PUBLIC 
        ? user.skillEntries 
        : [],
      socialLinks: canViewPrivateInfo || user.contactUrlPrivacy === PrivacyLevel.PUBLIC 
        ? user.socialLinks 
        : [],
    };
    
    return NextResponse.json(filteredProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
} 