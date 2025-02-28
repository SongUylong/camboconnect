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
    const { searchParams } = new URL(req.url);
    
    // Parse filters for opportunities
    const categoryId = searchParams.get('category');
    const status = searchParams.get('status');
    
    // Get current user for following status
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Build query conditions for opportunities
    const whereOpportunities: any = {
      organizationId: id,
    };
    
    if (categoryId) {
      whereOpportunities.categoryId = categoryId;
    }
    
    if (status) {
      whereOpportunities.status = status;
    }
    
    // Fetch the organization with all related data
    const organization = await db.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            followers: true,
            opportunities: true,
          },
        },
        followers: userId ? {
          where: {
            userId,
          },
        } : false,
        opportunities: {
          where: whereOpportunities,
          include: {
            category: true,
            organization: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            bookmarks: userId ? {
              where: {
                userId,
              },
            } : false,
          },
          orderBy: {
            deadline: 'asc',
          },
        },
      },
    });
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Transform data for front-end
    const { followers, _count, opportunities, ...orgData } = organization;
    
    const transformedOpportunities = opportunities.map((opp) => {
      const { bookmarks, ...oppData } = opp;
      return {
        ...oppData,
        isBookmarked: userId ? bookmarks.length > 0 : false,
      };
    });
    
    const transformedOrganization = {
      ...orgData,
      followerCount: _count.followers,
      opportunityCount: _count.opportunities,
      isFollowing: userId ? followers.length > 0 : false,
      opportunities: transformedOpportunities,
    };
    
    return NextResponse.json(transformedOrganization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only admin users can update organizations
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
    
    // Update organization
    const organization = await db.organization.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        logo: body.logo,
        website: body.website,
        history: body.history,
        termsOfService: body.termsOfService,
      },
    });
    
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only admin users can delete organizations
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
    
    // Check if organization has related opportunities
    const opportunitiesCount = await db.opportunity.count({
      where: {
        organizationId: id,
      },
    });
    
    if (opportunitiesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete organization with existing opportunities' },
        { status: 400 }
      );
    }
    
    // Delete organization
    await db.organization.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: 'Organization deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}