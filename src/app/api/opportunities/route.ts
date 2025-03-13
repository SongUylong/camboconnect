import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

// Validation schemas
const createOpportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  eligibility: z.string().min(1),
  applicationProcess: z.string().min(1),
  benefits: z.string().min(1),
  contactInfo: z.string().min(1),
  deadline: z.string().datetime(),
  categoryId: z.string(),
  organizationId: z.string(),
  status: z.enum(['OPENING_SOON', 'ACTIVE', 'CLOSING_SOON', 'CLOSED']),
  externalLink: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isPopular: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse all possible filter params
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const query = searchParams.get('q');
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
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
    
    // Fetch opportunities with pagination
    const [opportunities, totalCount] = await Promise.all([
      db.opportunity.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      db.opportunity.count({ where }),
    ]);
    
    // Add isBookmarked flag
    const transformedOpportunities = opportunities.map(opportunity => {
      const { bookmarks, ...rest } = opportunity;
      return {
        ...rest,
        isBookmarked: userId ? bookmarks.length > 0 : false,
      };
    });
    
    return NextResponse.json({
      opportunities: transformedOpportunities,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    }, {
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
    
    // Validate request body
    const validatedData = createOpportunitySchema.parse(body);
    
    // Create opportunity
    const opportunity = await db.opportunity.create({
      data: {
        ...validatedData,
        deadline: new Date(validatedData.deadline),
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        isNew: true,
      },
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
    
    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}