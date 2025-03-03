import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    
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

    // Fetch opportunities
    const opportunities = await db.opportunity.findMany({
      where: whereClause,
      orderBy: {
        deadline: "asc",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
} 