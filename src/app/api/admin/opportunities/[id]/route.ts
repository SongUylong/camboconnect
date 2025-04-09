// src/app/api/admin/opportunities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { opportunitySchema } from '@/lib/schemas/opportunitySchema'; // Adjust path if needed

interface Params {
    params: { id: string };
}

// --- PUT Handler (Update Opportunity) ---
export async function PUT(req: NextRequest, { params }: Params) {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!id) {
        return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }
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
        // Use the full schema because the form sends all fields
        const validatedData = opportunitySchema.parse(parsedBody);

        // Update the opportunity
        const updatedOpportunity = await db.opportunity.update({
            where: { id },
            data: validatedData, // Pass the full validated data object
        });

        return NextResponse.json(updatedOpportunity, { status: 200 });

    } catch (error: any) {
         console.error(`Failed to update opportunity ${id}:`, error);
         if (error instanceof z.ZodError) {
             return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
         }
         if (error.code === 'P2025') { // Prisma code for Record not found
            return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
         }
        return NextResponse.json({ error: 'Failed to update opportunity. Please check your input.' }, { status: 500 });
    }
}

// --- DELETE Handler (Delete Opportunity) ---
export async function DELETE(req: NextRequest, { params }: Params) {
    const { id } = params;
    const session = await getServerSession(authOptions);

     if (!id) {
        return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    try {
        // Check for bookmarks before deleting (optional, but good practice)
        const bookmarksCount = await db.bookmark.count({
          where: { opportunityId: id },
        });

        if (bookmarksCount > 0) {
          return NextResponse.json(
            { error: 'Cannot delete opportunity that has been bookmarked by users' },
            { status: 409 } // 409 Conflict
          );
        }

        // You might want to add checks for Applications or Participations here too if needed

        // Attempt to delete the opportunity
        await db.opportunity.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Opportunity deleted successfully' }, { status: 200 });

    } catch (error: any) {
        console.error(`Failed to delete opportunity ${id}:`, error);
        if (error.code === 'P2025') { // Prisma code for Record not found
           return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
        }
        // Catch other potential constraint errors if needed (less common with the bookmark check)
       return NextResponse.json({ error: 'Failed to delete opportunity.' }, { status: 500 });
    }
}