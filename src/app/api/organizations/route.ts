import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse search query
    const query = searchParams.get('q');
    
    // Build query conditions
    const where: any = {};
    
    if (query) {
      where.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    // Get current user for following status
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Fetch organizations with counts
    const organizations = await db.organization.findMany({
      where,
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
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Transform data for front-end
    const transformedOrganizations = organizations.map((org) => {
      const { followers, _count, ...rest } = org;
      return {
        ...rest,
        followerCount: _count.followers,
        opportunityCount: _count.opportunities,
        isFollowing: userId ? followers.length > 0 : false,
      };
    });
    
    return NextResponse.json(transformedOrganizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only admin users can create new organizations
export async function POST(req: Request) {
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
    
    // Validate required fields
    const requiredFields = ['name', 'description'];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create organization
    const organization = await db.organization.create({
      data: {
        name: body.name,
        description: body.description,
        logo: body.logo,
        website: body.website,
        history: body.history,
        termsOfService: body.termsOfService,
      },
    });
    
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}