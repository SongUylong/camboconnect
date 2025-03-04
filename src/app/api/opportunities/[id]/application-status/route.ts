import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(req: Request, { params }: ParamsType) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the user's application for this opportunity
    const application = await db.application.findFirst({
      where: {
        userId: session.user.id,
        opportunityId: id,
      },
      include: {
        status: true,
      },
    });
    
    if (!application) {
      return NextResponse.json({ status: null });
    }
    
    return NextResponse.json({ status: application.status });
  } catch (error) {
    console.error('Error fetching application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 