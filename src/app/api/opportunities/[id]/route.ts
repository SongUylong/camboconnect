// src/app/api/opportunities/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrivacyLevel } from '@prisma/client';

interface ParamsType {
  params: {
    id: string;
  };
}

// --- GET Handler (Public View) ---
export async function GET(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 });
    }

    // Get current user for bookmark status (optional, can be null if not logged in)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Run view count update and fetch in parallel for efficiency
    const [_, opportunity] = await Promise.all([
        db.opportunity.update({
          where: { id },
          data: { visitCount: { increment: 1 } },
        }),
        db.opportunity.findUnique({
          where: { id },
          include: {
            organization: true, // Include full organization needed for details page
            category: true,     // Include full category
            // Include bookmarks only if user is logged in
            bookmarks: userId ? { where: { userId } } : false,
            participations: {
              where: { privacyLevel: PrivacyLevel.PUBLIC }, // Simplify for now, can add friend logic if needed
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, profileImage: true, privacyLevel: true },
                },
              },
              orderBy: { year: 'desc' },
            },
          },
        })
    ]);


    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Add isBookmarked flag
    // Prisma returns relations as arrays, even with a where clause matching one user
    const isBookmarked = userId ? (opportunity.bookmarks?.length ?? 0) > 0 : false;

    // Remove the bookmarks array itself before sending to client if not needed directly
    const { bookmarks, ...rest } = opportunity;

    const responseData = {
      ...rest,
      isBookmarked,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error(`Error fetching opportunity ${params.id}:`, error);
    // Handle Prisma not found error specifically during the findUnique call
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// REMOVED PUT and DELETE handlers from this file