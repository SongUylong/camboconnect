import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10; // Items per page
    const sort = searchParams.get("sort") || "createdAt-desc";


    // Parse sort parameter
    const [sortField, sortOrder] = sort.split("-");
    
    // Build where clause
    const where: Prisma.OrganizationWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };


    // Get total count for pagination
    const total = await db.organization.count({ where });

    const totalPages = Math.ceil(total / limit);

    // Get organizations with pagination, sorting, and relations
    const organizations = await db.organization.findMany({
      where,
      orderBy: {
        [sortField]: sortOrder.toLowerCase() as Prisma.SortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            opportunities: true,
          },
        },
      },
    });

    return NextResponse.json({
      organizations,
      totalPages,
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/organizations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}