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
    
    // Check if application already exists
    const existingApplication = await db.application.findFirst({
      where: {
        userId,
        opportunityId: id,
      },
      include: {
        status: true
      }
    });
    
    let application;
    
    if (existingApplication) {
      // Update existing application status
      const updatedStatus = await db.applicationStatusType.update({
        where: {
          id: existingApplication.status.id
        },
        data: {
          isApplied,
          isConfirm,
        },
      });

      application = await db.application.findUnique({
        where: {
          id: existingApplication.id,
        },
        include: {
          status: true,
        },
      });
    } else {
      // Create new application with new status
      const newStatus = await db.applicationStatusType.create({
        data: {
          isApplied,
          isConfirm,
        },
      });

      application = await db.application.create({
        data: {
          userId,
          opportunityId: id,
          statusId: newStatus.id,
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