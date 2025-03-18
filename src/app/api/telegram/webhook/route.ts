import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { verifyTelegramToken, sendTelegramMessage } from '@/lib/telegram';

// Types for Telegram webhook
interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export async function POST(req: Request) {
  try {
    // Parse the webhook data
    const data: TelegramUpdate = await req.json();
    
    // Check if this is a message update with text
    if (!data.message?.text) {
      return NextResponse.json({ ok: true });
    }
    
    const { message } = data;
    const chatId = message.chat.id;
    const messageText = message.text || '';
    
    // Check if the message is a /start command with a binding code
    if (messageText.startsWith('/start ')) {
      const bindCode = messageText.substring(7).trim();
      
      // Check if this binding code exists and is valid
      const user = await db.user.findFirst({
        where: {
          telegramBindCode: bindCode,
          telegramBindExpiry: {
            gt: new Date() // Binding code has not expired
          }
        }
      });
      
      if (user) {
        // Update the user with the Telegram chat ID and username
        await db.user.update({
          where: { id: user.id },
          data: {
            telegramChatId: chatId.toString(),
            telegramUsername: message.chat.username || null,
            telegramBindCode: null, // Clear the binding code
            telegramBindExpiry: null // Clear the expiry time
          }
        });
        
        // Send a confirmation message to the user
        await sendTelegramMessage(
          chatId, 
          `✅ <b>Successfully connected!</b>\n\nYour Telegram account is now linked to CamboConnect. You will receive notifications here when there are updates from the platform.`
        );
        
        // Generate link to return to the app
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const returnLink = `${appUrl}/settings/notifications?telegram=success`;
        
        // Send link to return to the app
        await sendTelegramMessage(
          chatId,
          `<a href="${returnLink}">Click here to return to CamboConnect</a>`
        );
        
        return NextResponse.json({ ok: true });
      } else {
        // Invalid or expired binding code
        await sendTelegramMessage(
          chatId,
          '❌ <b>Invalid or expired code</b>\n\nThe binding code is invalid or has expired. Please generate a new code from the CamboConnect platform.'
        );
        
        return NextResponse.json({ ok: true });
      }
    }
    
    // Handle other commands or messages
    if (messageText === '/start') {
      // Generic start command without binding code
      await sendTelegramMessage(
        chatId,
        'Welcome to CamboConnect Bot! To connect your account, please use the link from the CamboConnect platform.'
      );
    } else if (messageText === '/help') {
      // Help command
      await sendTelegramMessage(
        chatId,
        '<b>CamboConnect Bot Help</b>\n\n' +
        '/start - Start the bot\n' +
        '/help - Show this help message\n' +
        '/status - Check your connection status'
      );
    } else if (messageText === '/status') {
      // Status command
      const user = await db.user.findFirst({
        where: {
          telegramChatId: chatId.toString()
        }
      });
      
      if (user) {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Connected</b>\n\nYour Telegram account is linked to CamboConnect as ${user.firstName} ${user.lastName} (${user.email}).`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          '❌ <b>Not connected</b>\n\nYour Telegram account is not linked to any CamboConnect account yet.'
        );
      }
    } else {
      // Default response
      await sendTelegramMessage(
        chatId,
        'I only understand commands like /start, /help, and /status. For assistance, use /help.'
      );
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to verify the webhook
export async function GET(req: Request) {
  return NextResponse.json({ ok: true, message: 'Telegram webhook is active' });
} 