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
    const { isApplied, isConfirm } = body;
    
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
    
    // Create or update application status
    const statusType = await db.applicationStatusType.create({
      data: {
        isApplied,
        isConfirm,
      },
    });
    
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
        message: isConfirm 
          ? `Your application for ${opportunity.title} has been ${isApplied ? 'completed' : 'started'}`
          : `Please confirm your application status for ${opportunity.title}`,
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