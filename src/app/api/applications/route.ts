import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applications = await db.application.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        opportunityId: true,
        status: {
          select: {
            isApplied: true,
            isConfirm: true
          }
        },
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
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 