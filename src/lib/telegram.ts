import axios from 'axios';

// Replace with your actual Telegram Bot Token from BotFather
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message to a Telegram chat
 */
export async function sendTelegramMessage(chatId: string | number, message: string, parseMode: 'HTML' | 'Markdown' | 'MarkdownV2' = 'HTML') {
  try {
    const response = await axios.post(`${API_URL}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: parseMode
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

/**
 * Generate a deep link for Telegram bot
 */
export function generateTelegramBotLink(botUsername: string, startParameter: string): string {
  if (!botUsername) {
    throw new Error('Bot username is required');
  }
  if (!startParameter) {
    throw new Error('Start parameter is required');
  }
  
  // Remove any @ symbol if present in the username
  const cleanUsername = botUsername.replace(/^@/, '');
  return `https://t.me/${cleanUsername}?start=${encodeURIComponent(startParameter)}`;
}

/**
 * Get Telegram user info from chat ID
 */
export async function getTelegramUserInfo(chatId: string | number) {
  try {
    const response = await axios.get(`${API_URL}/getChat`, {
      params: {
        chat_id: chatId
      }
    });
    
    return response.data.result;
  } catch (error) {
    console.error('Error getting Telegram user info:', error);
    throw error;
  }
}

/**
 * Verify Telegram webhook token
 */
export function verifyTelegramToken(token: string) {
  return token === process.env.TELEGRAM_WEBHOOK_TOKEN;
} 