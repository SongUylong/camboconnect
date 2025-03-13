import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

// Validation schema for updates
const updateOpportunitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().min(1).optional(),
  eligibility: z.string().min(1).optional(),
  applicationProcess: z.string().min(1).optional(),
  benefits: z.string().min(1).optional(),
  contactInfo: z.string().min(1).optional(),
  deadline: z.string().datetime().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['OPENING_SOON', 'ACTIVE', 'CLOSING_SOON', 'CLOSED']).optional(),
  externalLink: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isPopular: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const opportunity = await db.opportunity.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        category: true,
        bookmarks: userId ? {
          where: {
            userId,
          },
        } : false,
        applications: {
          where: userId ? {
            userId,
          } : undefined,
          include: {
            status: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Transform response to include isBookmarked flag
    const { bookmarks, ...rest } = opportunity;
    const transformedOpportunity = {
      ...rest,
      isBookmarked: userId ? bookmarks.length > 0 : false,
    };

    return NextResponse.json(transformedOpportunity, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and admin status
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate request body
    const validatedData = updateOpportunitySchema.parse(body);
    
    // Convert date strings to Date objects
    const updateData = {
      ...validatedData,
      ...(validatedData.deadline && { deadline: new Date(validatedData.deadline) }),
      ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
      ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) }),
    };

    const opportunity = await db.opportunity.update({
      where: { id: params.id },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and admin status
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await db.opportunity.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}