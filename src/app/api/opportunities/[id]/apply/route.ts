import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function POST(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { statusId } = body;
    
    // Check if opportunity exists
    const opportunity = await db.opportunity.findUnique({
      where: { id },
    });
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }
    
    // Get the appropriate application status type
    let statusType;
    if (statusId === "pending") {
      statusType = await db.applicationStatusType.findFirst({
        where: { name: "Pending Confirmation" },
      });
    } else if (statusId === "applied") {
      statusType = await db.applicationStatusType.findFirst({
        where: { name: "Applied" },
      });
    } else if (statusId === "not_applied") {
      statusType = await db.applicationStatusType.findFirst({
        where: { name: "Not Applied" },
      });
    }
    
    if (!statusType) {
      return NextResponse.json(
        { error: 'Invalid application status' },
        { status: 400 }
      );
    }
    
    // Check if application already exists
    const existingApplication = await db.application.findFirst({
      where: {
        userId,
        opportunityId: id,
      },
    });
    
    let application;
    
    if (existingApplication) {
      // Update existing application
      application = await db.application.update({
        where: {
          id: existingApplication.id,
        },
        data: {
          statusId: statusType.id,
        },
        include: {
          status: true,
        },
      });
    } else {
      // Create new application
      application = await db.application.create({
        data: {
          userId,
          opportunityId: id,
          statusId: statusType.id,
        },
        include: {
          status: true,
        },
      });
    }
    
    // Create a notification for the user
    await db.notification.create({
      data: {
        userId,
        type: 'APPLICATION_UPDATE',
        message: `Your application status for ${opportunity.title} has been updated to ${application.status.name}`,
        relatedEntityId: id,
      },
    });
    
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error handling application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}