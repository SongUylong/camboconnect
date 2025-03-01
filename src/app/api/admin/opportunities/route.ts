import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  
  // Parse search params
  const query = searchParams.get('q') || "";
  const categoryId = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;
  const sort = searchParams.get('sort') || "createdAt-desc";
  const page = parseInt(searchParams.get('page') || "1");
  const pageSize = 20;
  
  // Build where clause
  const whereClause: any = {};
  
  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
    ];
  }
  
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }
  
  if (status) {
    whereClause.status = status;
  }
  
  // Parse sort
  const [sortField, sortOrder] = sort.split("-");
  const orderBy: any = {};
  orderBy[sortField] = sortOrder;
  
  try {
    // Fetch opportunities
    const opportunities = await db.opportunity.findMany({
      where: whereClause,
      include: {
        organization: true,
        category: true,
        _count: {
          select: {
            applications: true,
            bookmarks: true,
            participations: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    // Get total count for pagination
    const totalCount = await db.opportunity.count({
      where: whereClause,
    });
    
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return NextResponse.json({
      opportunities,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
} 