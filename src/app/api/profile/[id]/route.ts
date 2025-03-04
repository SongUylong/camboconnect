import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrivacyLevel } from '@prisma/client';

type ParamsType = {
  params: {
    id: string;
  };
};

async function canViewContent(viewerId: string | undefined, ownerId: string, privacyLevel: PrivacyLevel) {
  if (!viewerId) return privacyLevel === 'PUBLIC';
  if (viewerId === ownerId) return true;
  
  if (privacyLevel === 'FRIENDS_ONLY') {
    const friendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: viewerId, friendId: ownerId },
          { userId: ownerId, friendId: viewerId },
        ],
      },
    });
    return !!friendship;
  }
  
  return privacyLevel === 'PUBLIC';
}

export async function GET(req: Request, { params }: ParamsType) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Fetch user with all profile data
    const user = await db.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        bio: true,
        educationPrivacy: true,
        experiencePrivacy: true,
        skillsPrivacy: true,
        contactUrlPrivacy: true,
        educationEntries: true,
        experienceEntries: true,
        skillEntries: true,
        socialLinks: true,
        participations: {
          select: {
            id: true,
            year: true,
            feedback: true,
            privacyLevel: true,
            opportunity: {
              select: {
                id: true,
                title: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            participations: true,
            applications: true,
            friends: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check privacy settings and filter data accordingly
    const viewerId = session?.user?.id;
    const canViewEducation = await canViewContent(viewerId, id, user.educationPrivacy);
    const canViewExperience = await canViewContent(viewerId, id, user.experiencePrivacy);
    const canViewSkills = await canViewContent(viewerId, id, user.skillsPrivacy);
    const canViewContactUrls = await canViewContent(viewerId, id, user.contactUrlPrivacy);

    // Filter participations based on privacy
    const visibleParticipations = await Promise.all(
      user.participations.map(async (participation) => {
        const canView = await canViewContent(viewerId, id, participation.privacyLevel);
        return canView ? {
          id: participation.id,
          year: participation.year,
          feedback: participation.feedback,
          opportunity: {
            id: participation.opportunity.id,
            title: participation.opportunity.title,
            organization: {
              id: participation.opportunity.organization.id,
              name: participation.opportunity.organization.name,
            },
          },
        } : null;
      })
    );

    // Construct response with privacy-filtered data
    const response = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage,
      bio: user.bio,
      education: canViewEducation ? user.educationEntries : [],
      experience: canViewExperience ? user.experienceEntries : [],
      skills: canViewSkills ? user.skillEntries : [],
      socialLinks: canViewContactUrls ? user.socialLinks : [],
      participations: visibleParticipations.filter(Boolean),
      stats: {
        participationsCount: user._count.participations,
        applicationsCount: user._count.applications,
        friendsCount: user._count.friends,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 