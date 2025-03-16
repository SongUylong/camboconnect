import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/opportunities
 * 
 * Retrieves a paginated list of opportunities with filtering and sorting options.
 * 
 * Query Parameters:
 * - category: Filter by category ID
 * - status: Filter by opportunity status (ACTIVE, OPENING_SOON, CLOSING_SOON, CLOSED)
 * - q: Search query for text search in title, description, and shortDescription
 * - sort: Sort order (latest, deadline, popular)
 * - page: Page number for pagination
 * 
 * Returns:
 * - opportunities: Array of opportunity objects with related data
 * - totalCount: Total number of opportunities matching the filters
 * - totalPages: Total number of pages
 * - currentPage: Current page number
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse all possible filter params
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const query = searchParams.get('q');
    const sort = searchParams.get('sort') || 'latest';
    
    // Pagination params
    const page = parseInt(searchParams.get('page') || "1");
    const pageSize = 12; // Show 12 opportunities per page (4 rows of 3 in desktop view)
    
    // Build query conditions
    const where: any = {};
    
    // Add category filter if provided
    if (category) {
      where.categoryId = category;
    }
    
    // Add status filter if provided
    if (status) {
      where.status = status;
    }
    
    // Add text search if query parameter is provided
    // Searches in title, description, and shortDescription fields
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
    
    // Determine sort order based on the sort parameter
    let orderBy: any = { createdAt: 'desc' }; // Default: newest first
    if (sort === 'deadline') {
      orderBy = { deadline: 'asc' }; // Sort by closest deadline first
    } else if (sort === 'popular') {
      orderBy = { visitCount: 'desc' }; // Sort by most visited first
    }
    
    // Get current user for bookmark status
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Fetch opportunities with pagination, including related data
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
        // Only fetch bookmarks if user is logged in
        bookmarks: userId ? {
          where: {
            userId,
          },
        } : false,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    // Get total count for pagination calculation
    const totalCount = await db.opportunity.count({
      where,
    });
    
    // Calculate total number of pages
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Transform opportunities to include bookmark status
    // This simplifies the data structure for the client
    const transformedOpportunities = opportunities.map(opportunity => {
      const { bookmarks, ...rest } = opportunity;
      return {
        ...rest,
        isBookmarked: userId ? bookmarks.length > 0 : false,
      };
    });
    
    // Return the opportunities with pagination metadata
    return NextResponse.json({
      opportunities: transformedOpportunities,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/opportunities
 * 
 * Creates a new opportunity.
 * Restricted to admin users only.
 * 
 * Request Body:
 * - title: Opportunity title
 * - description: Full description
 * - shortDescription: Brief summary
 * - eligibility: Eligibility requirements
 * - applicationProcess: How to apply
 * - benefits: Benefits offered
 * - contactInfo: Contact information
 * - externalLink: Optional external application link
 * - deadline: Application deadline date
 * - startDate: Optional start date
 * - endDate: Optional end date
 * - status: Current status (ACTIVE, OPENING_SOON, etc.)
 * - categoryId: Category ID
 * - organizationId: Organization ID
 * - isPopular: Whether to mark as popular (optional)
 * 
 * Returns:
 * - The created opportunity object
 */
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
    
    // Create opportunity with the provided data
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
        isNew: true, // Mark all new opportunities as "new"
      },
    });
    
    // Return the created opportunity with 201 Created status
    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}