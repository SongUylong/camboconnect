import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface ParamsType {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session || !session.user.id) {
      return NextResponse.json(
        { following: false },
        { status: 200 }
      );
    }
    
    const userId = session.user.id;
    
    // Check if follow relationship exists
    const existingFollow = await db.follow.findFirst({
      where: {
        userId,
        organizationId: id,
      },
    });
    
    return NextResponse.json({
      following: !!existingFollow,
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 