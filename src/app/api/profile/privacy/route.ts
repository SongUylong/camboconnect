import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrivacyLevel } from '@prisma/client';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      educationPrivacy,
      experiencePrivacy,
      skillsPrivacy,
      contactUrlPrivacy
    } = body;

    // Validate privacy levels
    const validPrivacyLevels = ['PUBLIC', 'ONLY_ME', 'FRIENDS_ONLY'];
    const privacyFields = {
      educationPrivacy,
      experiencePrivacy,
      skillsPrivacy,
      contactUrlPrivacy
    };

    for (const [field, value] of Object.entries(privacyFields)) {
      if (value && !validPrivacyLevels.includes(value)) {
        return NextResponse.json(
          { error: `Invalid privacy level for ${field}` },
          { status: 400 }
        );
      }
    }

    // Update user privacy settings
    const updatedUser = await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        educationPrivacy: educationPrivacy as PrivacyLevel,
        experiencePrivacy: experiencePrivacy as PrivacyLevel,
        skillsPrivacy: skillsPrivacy as PrivacyLevel,
        contactUrlPrivacy: contactUrlPrivacy as PrivacyLevel,
      },
      select: {
        id: true,
        educationPrivacy: true,
        experiencePrivacy: true,
        skillsPrivacy: true,
        contactUrlPrivacy: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        educationPrivacy: true,
        experiencePrivacy: true,
        skillsPrivacy: true,
        contactUrlPrivacy: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
} 