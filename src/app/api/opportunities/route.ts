import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse all possible filter params
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const query = searchParams.get('q');
    const sort = searchParams.get('sort') || 'latest';
    
    // Build query conditions
    const where: any = {};
    
    if (category) {
      where.categoryId = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (query) {
      where.OR = [
        {
          title: {
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
        {
          shortDescription: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'deadline') {
      orderBy = { deadline: 'asc' };
    } else if (sort === 'popular') {
      orderBy = { visitCount: 'desc' };
    }
    
    // Get current user for bookmark status
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Fetch opportunities
    const opportunities = await db.opportunity.findMany({
      where,
      orderBy,
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
      },
    });
    
    // Add isBookmarked flag
    const transformedOpportunities = opportunities.map(opportunity => {
      const { bookmarks, ...rest } = opportunity;
      return {
        ...rest,
        isBookmarked: userId ? bookmarks.length > 0 : false,
      };
    });
    
    return NextResponse.json(transformedOpportunities, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only admin users can create new opportunities
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
    const requiredFields = [
      'title', 'description', 'shortDescription', 'eligibility',
      'applicationProcess', 'benefits', 'contactInfo', 'deadline', 
      'categoryId', 'organizationId', 'status'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create opportunity
    const opportunity = await db.opportunity.create({
      data: {
        title: body.title,
        description: body.description,
        shortDescription: body.shortDescription,
        eligibility: body.eligibility,
        applicationProcess: body.applicationProcess,
        benefits: body.benefits,
        contactInfo: body.contactInfo,
        externalLink: body.externalLink,
        deadline: new Date(body.deadline),
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        status: body.status,
        categoryId: body.categoryId,
        organizationId: body.organizationId,
        isPopular: body.isPopular || false,
        isNew: true,
      },
    });
    
    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}