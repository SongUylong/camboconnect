import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { generateTelegramBotLink } from '@/lib/telegram';

export async function GET(req: Request) {
  try {
    console.log('Starting generate-code request');
    
    // Log request headers
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const session = await getServerSession(authOptions);
    console.log('Session data:', session ? 'Session exists' : 'No session');
    
    // Check if user is authenticated
    if (!session?.user) {
      console.log('Authentication failed: No session or user');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in again' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('Generating code for user:', userId);
    
    // Generate a random 6-character code
    const bindCode = randomBytes(3).toString('hex');
    console.log('Generated bind code:', bindCode);
    
    // Set expiry time (15 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);
    
    try {
      // Save the code in the user's record
      await db.user.update({
        where: { id: userId },
        data: {
          telegramBindCode: bindCode,
          telegramBindExpiry: expiryTime
        }
      });
      console.log('Updated user record with bind code');
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save binding code to database', details: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }
    
    // Get Telegram bot username from environment
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    console.log('Bot username from env:', botUsername);
    
    if (!botUsername) {
      console.error('Telegram bot username not configured in environment variables');
      return NextResponse.json(
        { error: 'Telegram bot not configured properly' },
        { status: 500 }
      );
    }
    
    // Generate the Telegram deep link
    const telegramLink = generateTelegramBotLink(botUsername, bindCode);
    console.log('Generated Telegram link:', telegramLink);
    
    const response = NextResponse.json({
      success: true,
      telegramLink,
      code: bindCode,
      expires: expiryTime
    });
    
    // Add CORS headers
    const origin = req.headers.get('origin');
    if (origin) {
      if (process.env.NODE_ENV === 'development' || origin === process.env.NEXT_PUBLIC_URL) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
    }
    
    return response;
  } catch (error) {
    console.error('Detailed error in generate-code:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to generate Telegram binding code', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(req: Request) {
  const response = new NextResponse(null, { status: 204 });
  
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_URL || 'https://uylongsong.lol');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
} 