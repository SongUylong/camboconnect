import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PrivacyLevel } from "@prisma/client";

interface ParamsType {
  params: {
    id: string;
  };
}

// Helper function to check if a user can view content based on privacy level
async function canViewContent(viewerId: string, ownerId: string, privacyLevel: PrivacyLevel) {
  // Owner can always view their own content
  if (viewerId === ownerId) return true;
  
  // For FRIENDS_ONLY, check if they are friends
  if (privacyLevel === PrivacyLevel.FRIENDS_ONLY) {
    const friendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: viewerId, friendId: ownerId },
          { userId: ownerId, friendId: viewerId }
        ]
      }
    });
    return !!friendship;
  }
  
  // For PUBLIC, anyone can view
  return privacyLevel === PrivacyLevel.PUBLIC;
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
        _count: {
          select: {
            participations: true,
            applications: true,
            friendsOf: true,
          }
        }
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

    // Check privacy settings for each section
    const canViewEducation = await canViewContent(userId, id, user.educationPrivacy);
    const canViewExperience = await canViewContent(userId, id, user.experiencePrivacy);
    const canViewSkills = await canViewContent(userId, id, user.skillsPrivacy);
    const canViewSocialLinks = await canViewContent(userId, id, user.contactUrlPrivacy);

    // Determine if user can view private info (for email and bio)
    const isSelf = userId === id;
    const isFriend = !!friendship;

    // Filter information based on privacy settings
    const filteredProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email, // Email is always public
      profileImage: user.profileImage,
      bio: user.bio, // Bio is always public
      privacyLevel: user.privacyLevel,
      isFriend,
      hasPendingRequest: !!pendingRequest,
      education: canViewEducation ? user.educationEntries : [],
      experience: canViewExperience ? user.experienceEntries : [],
      skills: canViewSkills ? user.skillEntries : [],
      socialLinks: canViewSocialLinks ? user.socialLinks : [],
      // Add counts that are always public
      counts: {
        participations: user._count.participations,
        applications: user._count.applications,
        friends: user._count.friendsOf
      },
      // Add privacy information to help the UI distinguish between empty data and private data
      privacySettings: {
        educationPrivacy: user.educationPrivacy,
        experiencePrivacy: user.experiencePrivacy,
        skillsPrivacy: user.skillsPrivacy,
        contactUrlPrivacy: user.contactUrlPrivacy,
        canViewEducation,
        canViewExperience,
        canViewSkills,
        canViewSocialLinks
      }
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