import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { generateTelegramBotLink } from '@/lib/telegram';

export async function GET(req: Request) {
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
    
    // Generate a random 6-character code
    const bindCode = randomBytes(3).toString('hex');
    
    // Set expiry time (15 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);
    
    // Save the code in the user's record
    await db.user.update({
      where: { id: userId },
      data: {
        telegramBindCode: bindCode,
        telegramBindExpiry: expiryTime
      }
    });
    
    // Get Telegram bot username from environment
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    
    if (!botUsername) {
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 500 }
      );
    }
    
    // Generate the Telegram deep link
    const telegramLink = generateTelegramBotLink(botUsername, bindCode);
    
    return NextResponse.json({
      success: true,
      telegramLink,
      code: bindCode,
      expires: expiryTime
    });
  } catch (error) {
    console.error('Error generating Telegram binding code:', error);
    return NextResponse.json(
      { error: 'Failed to generate Telegram binding code' },
      { status: 500 }
    );
  }
} 