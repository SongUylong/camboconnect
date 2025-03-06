import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // Build query conditions
    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    // Fetch organizations with counts
    const organizations = await db.organization.findMany({
      where: whereClause,
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            followers: true,
            opportunities: true,
          },
        },
      },
    });

    // Transform the results
    const transformedOrganizations = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      description: org.description,
      logo: org.logo,
      website: org.website,
      history: org.history,
      termsOfService: org.termsOfService,
      followerCount: org._count.followers,
      opportunityCount: org._count.opportunities,
    }));

    return NextResponse.json(transformedOrganizations);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
} 