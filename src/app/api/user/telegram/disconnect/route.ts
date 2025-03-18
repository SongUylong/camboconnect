import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Update user to remove Telegram information
    await db.user.update({
      where: { id: userId },
      data: {
        telegramChatId: null,
        telegramUsername: null,
        telegramBindCode: null,
        telegramBindExpiry: null
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Telegram disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting Telegram:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Telegram' },
      { status: 500 }
    );
  }
} 