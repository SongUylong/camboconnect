import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrivacyLevel } from '@prisma/client';
import { z } from "zod";

interface ParamsType {
  params: {
    id: string;
  };
}

const privacySchema = z.object({
  privacyLevel: z.enum(["PUBLIC", "FRIENDS_ONLY", "ONLY_ME"])
});

export async function PUT(request: Request, { params }: ParamsType) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { privacyLevel } = privacySchema.parse(body);

    const participation = await db.participation.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
      }
    });

    if (!participation) {
      return NextResponse.json(
        { error: 'Participation not found' },
        { status: 404 }
      );
    }

    if (participation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updatedParticipation = await db.participation.update({
      where: { id: params.id },
      data: {
        privacyLevel
      }
    });

    return NextResponse.json({
      id: updatedParticipation.id,
      privacyLevel: updatedParticipation.privacyLevel
    });
  } catch (error) {
    console.error('Error updating participation privacy:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid privacy level' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: ParamsType) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const participation = await db.participation.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        privacyLevel: true,
        userId: true,
      }
    });

    if (!participation) {
      return NextResponse.json(
        { error: 'Participation not found' },
        { status: 404 }
      );
    }

    if (participation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: participation.id,
      privacyLevel: participation.privacyLevel
    });
  } catch (error) {
    console.error('Error fetching participation privacy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 