import { db } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';
import { NotificationType } from '@prisma/client';

interface NotificationData {
  userId: string;
  type: NotificationType;
  message: string;
  relatedEntityId?: string;
}

/**
 * Create a notification and optionally send it to Telegram
 */
export async function createNotification({
  userId,
  type,
  message,
  relatedEntityId
}: NotificationData): Promise<any> {
  try {
    // Create notification in the database
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        message,
        relatedEntityId: relatedEntityId || null,
        isRead: false,
      }
    });
    
    // Check if user has Telegram connected and send notification
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        telegramChatId: true,
        firstName: true,
      }
    });
    
    if (user?.telegramChatId) {
      try {
        // Format message for Telegram
        const telegramMessage = formatTelegramMessage(type, message, relatedEntityId);
        
        // Send message to Telegram
        await sendTelegramMessage(user.telegramChatId, telegramMessage);
      } catch (telegramError) {
        console.error('Error sending notification to Telegram:', telegramError);
        // Don't fail the whole function if Telegram sending fails
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Format a notification message for Telegram
 */
function formatTelegramMessage(type: NotificationType, message: string, relatedEntityId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Add appropriate emoji based on notification type
  let emoji = '📢';
  let actionUrl = '';
  
  switch (type) {
    case 'FRIEND_REQUEST':
      emoji = '👥';
      actionUrl = `${baseUrl}/friends`;
      break;
    case 'NEW_OPPORTUNITY':
      emoji = '✨';
      actionUrl = relatedEntityId 
        ? `${baseUrl}/opportunities/${relatedEntityId}`
        : `${baseUrl}/opportunities`;
      break;
    case 'DEADLINE_REMINDER':
      emoji = '⏰';
      actionUrl = relatedEntityId
        ? `${baseUrl}/opportunities/${relatedEntityId}`
        : `${baseUrl}/profile/bookmarks`;
      break;
    case 'APPLICATION_UPDATE':
      emoji = '📝';
      if (message.toLowerCase().includes('confirm')) {
        actionUrl = relatedEntityId
          ? `${baseUrl}/opportunities/${relatedEntityId}?confirm=true`
          : `${baseUrl}/profile/applications`;
      } else {
        actionUrl = relatedEntityId
          ? `${baseUrl}/opportunities/${relatedEntityId}`
          : `${baseUrl}/profile/applications`;
      }
      break;
    case 'ORGANIZATION_UPDATE':
      emoji = '🏢';
      actionUrl = relatedEntityId
        ? `${baseUrl}/community/${relatedEntityId}`
        : `${baseUrl}/community`;
      break;
    default:
      actionUrl = baseUrl;
  }
  
  // Format the message with HTML
  let formattedMessage = `${emoji} <b>${message}</b>`;
  
  // Add view button if we have an action URL
  if (actionUrl) {
    formattedMessage += `\n\n<a href="${actionUrl}">View in CamboConnect</a>`;
  }
  
  return formattedMessage;
}

/**
 * Check if user has new notifications
 */
export async function hasNewNotifications(userId: string): Promise<boolean> {
  try {
    const count = await db.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    
    return count > 0;
  } catch (error) {
    console.error('Error checking for new notifications:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    await db.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
} 