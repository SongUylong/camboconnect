import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

type ParamsType = {
  params: {
    id: string;
  };
};

const participationSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  privacyLevel: z.enum(["PUBLIC", "ONLY_ME"]).default("ONLY_ME"),
  feedback: z.string().optional()
});

export async function POST(request: Request, { params }: ParamsType) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const opportunityId = params.id;

    // Validate opportunity exists
    const opportunity = await db.opportunity.findUnique({
      where: { id: opportunityId }
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = participationSchema.parse(body);

    // Check if participation already exists
    const existingParticipation = await db.participation.findFirst({
      where: {
        userId,
        opportunityId,
        year: validatedData.year
      }
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: "Participation record already exists for this year" },
        { status: 409 }
      );
    }

    // Create participation record
    const participation = await db.participation.create({
      data: {
        year: validatedData.year,
        privacyLevel: validatedData.privacyLevel,
        userId: session.user.id,
        opportunityId: opportunityId,
        feedback: validatedData.feedback
      }
    });

    return NextResponse.json(participation);
  } catch (error) {
    console.error("Error creating participation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 