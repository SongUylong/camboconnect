import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface ParamsType {
  params: {
    id: string;
  };
}

export async function POST(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { following } = body;
    
    // Check if organization exists
    const organization = await db.organization.findUnique({
      where: { id },
    });
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Check if follow relationship exists
    const existingFollow = await db.follow.findFirst({
      where: {
        userId,
        organizationId: id,
      },
    });
    
    if (following) {
      // Create follow relationship if it doesn't exist
      if (!existingFollow) {
        await db.follow.create({
          data: {
            userId,
            organizationId: id,
          },
        });
        
        // Create notification
        await db.notification.create({
          data: {
            userId,
            type: 'ORGANIZATION_UPDATE',
            message: `You are now following ${organization.name}`,
            relatedEntityId: id,
          },
        });
      }
      
      return NextResponse.json({
        following: true,
        message: `Now following ${organization.name}`,
      });
    } else {
      // Remove follow relationship if it exists
      if (existingFollow) {
        await db.follow.delete({
          where: {
            id: existingFollow.id,
          },
        });
      }
      
      return NextResponse.json({
        following: false,
        message: `Stopped following ${organization.name}`,
      });
    }
  } catch (error) {
    console.error('Error updating follow status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}