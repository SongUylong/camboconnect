import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Get the path to revalidate from the query parameters
    const path = request.nextUrl.searchParams.get('path');
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      );
    }

    // Revalidate the path
    revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      message: `Path ${path} revalidated successfully`,
    });
  } catch (error) {
    console.error('Error revalidating path:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate path' },
      { status: 500 }
    );
  }
} 