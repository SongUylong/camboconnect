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
    
    // Increment view count
    await db.opportunity.update({
      where: { id },
      data: { visitCount: { increment: 1 } },
    });
    
    // Get current user for bookmark status
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Fetch the opportunity with all related data
    const opportunity = await db.opportunity.findUnique({
      where: { id },
      include: {
        organization: true,
        category: true,
        bookmarks: userId ? {
          where: {
            userId,
          },
        } : false,
        participations: {
          where: {
            isPublic: true,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                privacyLevel: true,
              },
            },
          },
          orderBy: {
            year: 'desc',
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
    
    // Add isBookmarked flag
    const { bookmarks, ...rest } = opportunity;
    const transformedOpportunity = {
      ...rest,
      isBookmarked: userId ? bookmarks.length > 0 : false,
    };
    
    return NextResponse.json(transformedOpportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only admin users can update opportunities
export async function PUT(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication and admin status
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Update opportunity
    const opportunity = await db.opportunity.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        shortDescription: body.shortDescription,
        eligibility: body.eligibility,
        applicationProcess: body.applicationProcess,
        benefits: body.benefits,
        contactInfo: body.contactInfo,
        externalLink: body.externalLink,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        status: body.status,
        categoryId: body.categoryId,
        organizationId: body.organizationId,
        isPopular: body.isPopular,
      },
    });
    
    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only admin users can delete opportunities
export async function DELETE(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication and admin status
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if opportunity has any bookmarks
    const bookmarksCount = await db.bookmark.count({
      where: { opportunityId: id },
    });

    if (bookmarksCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete opportunity that has been bookmarked by users' },
        { status: 409 }
      );
    }
    
    // Delete opportunity
    await db.opportunity.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: 'Opportunity deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}