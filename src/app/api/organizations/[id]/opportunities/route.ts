import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    const session = await getServerSession(authOptions);
    
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("category") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const getCategories = url.searchParams.get("getCategories") === "true";

    // If getCategories is true, return only the categories for this organization
    if (getCategories) {
      const categories = await db.category.findMany({
        where: {
          opportunities: {
            some: {
              organizationId: organizationId,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json(categories);
    }

    // Build where clause
    const whereClause: any = {
      organizationId: organizationId,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Fetch opportunities with all necessary fields
    const opportunities = await db.opportunity.findMany({
      where: whereClause,
      orderBy: {
        deadline: "asc",
      },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        deadline: true,
        status: true,
        visitCount: true,
        isPopular: true,
        isNew: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        bookmarks: session?.user?.id ? {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        } : undefined,
      },
    });

    // Transform the data to match OpportunityCard props
    const transformedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      shortDescription: opp.shortDescription,
      deadline: opp.deadline,
      status: opp.status,
      visitCount: opp.visitCount,
      isPopular: opp.isPopular,
      isNew: opp.isNew,
      organization: opp.organization,
      category: opp.category,
      isBookmarked: opp.bookmarks && opp.bookmarks.length > 0,
    }));

    return NextResponse.json(transformedOpportunities);
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
} 