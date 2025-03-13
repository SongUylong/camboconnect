import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const applicationSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    // Check if opportunity exists
    const opportunity = await db.opportunity.findUnique({
      where: { id: params.id },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Check if user has already applied
    const existingApplication = await db.application.findFirst({
      where: {
        opportunityId: params.id,
        userId: session.user.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this opportunity' },
        { status: 400 }
      );
    }

    // Create application status
    const status = await db.applicationStatusType.create({
      data: {
        isApplied: validatedData.status === 'ACCEPTED',
        isConfirm: true,
      },
    });

    // Create application
    const application = await db.application.create({
      data: {
        opportunityId: params.id,
        userId: session.user.id,
        statusId: status.id,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}