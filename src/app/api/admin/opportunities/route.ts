// src/app/api/admin/opportunities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from 'zod';
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { opportunitySchema } from '@/lib/schemas/opportunitySchema'; // Adjust path if needed

// --- GET Handler (List for Admin) ---
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || "";
  const categoryId = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;
  const sort = searchParams.get('sort') || "createdAt-desc";
  const page = parseInt(searchParams.get('page') || "1");
  const pageSize = 20;

  const whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
    ];
  }
  if (categoryId) whereClause.categoryId = categoryId;
  if (status) whereClause.status = status;

  const [sortField, sortOrder] = sort.split("-");
  const orderBy: any = { [sortField]: sortOrder };

  try {
    const [opportunities, totalCount] = await Promise.all([
      db.opportunity.findMany({
        where: whereClause,
        include: {
          organization: true,
          category: true,
          _count: {
            select: { applications: true, bookmarks: true, participations: true },
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.opportunity.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      opportunities,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching admin opportunities:", error);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}

// --- POST Handler (Create Opportunity) ---
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    try {
        const body = await req.json();

        // --- Validate the incoming data ---
        // Convert date strings received from JSON to Date objects
        const parsedBody = {
             ...body,
             deadline: body.deadline ? new Date(body.deadline) : undefined, // required
             startDate: body.startDate ? new Date(body.startDate) : null, // optional, allow null
             endDate: body.endDate ? new Date(body.endDate) : null,   // optional, allow null
        };
        const validatedData = opportunitySchema.parse(parsedBody);

        // Create the opportunity in the database
        const newOpportunity = await db.opportunity.create({
            data: validatedData, // Pass the full validated data object
        });

        return NextResponse.json(newOpportunity, { status: 201 });

    } catch (error: any) {
         console.error("Failed to create opportunity:", error);
         if (error instanceof z.ZodError) {
             return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
         }
        return NextResponse.json({ error: 'Failed to create opportunity. Please check your input.' }, { status: 500 });
    }
}