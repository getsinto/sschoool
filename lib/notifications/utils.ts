import { formatDistanceToNow } from 'date-fns';
import { NotificationType, NotificationPriority } from '@/types/notification';

/**
 * Utility functions for notifications
 */

/**
 * Format notification time to relative string
 */
export function formatNotificationTime(timestamp: string): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    return 'Unknown time';
  }
}

/**
 * Get priority color class
 */
export function getPriorityColor(priority: NotificationPriority): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'normal':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
}

/**
 * Get type color class
 */
export function getTypeColor(type: NotificationType): string {
  switch (type) {
    case 'course':
      return 'text-blue-600 bg-blue-100';
    case 'assignment':
      return 'text-purple-600 bg-purple-100';
    case 'quiz':
      return 'text-indigo-600 bg-indigo-100';
    case 'grade':
      return 'text-green-600 bg-green-100';
    case 'live_class':
      return 'text-red-600 bg-red-100';
    case 'payment':
      return 'text-yellow-600 bg-yellow-100';
    case 'message':
      return 'text-pink-600 bg-pink-100';
    case 'announcement':
      return 'text-orange-600 bg-orange-100';
    case 'system':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-blue-600 bg-blue-100';
  }
}

/**
 * Truncate notification message
 */
export function truncateMessage(message: string, maxLength: number = 100): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength).trim() + '...';
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(notifications: any[]) {
  const groups: Record<string, any[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
  });

  return groups;
}

/**
 * Get notification type display name
 */
export function getTypeDisplayName(type: NotificationType): string {
  switch (type) {
    case 'course':
      return 'Course';
    case 'assignment':
      return 'Assignment';
    case 'quiz':
      return 'Quiz';
    case 'grade':
      return 'Grade';
    case 'live_class':
      return 'Live Class';
    case 'payment':
      return 'Payment';
    case 'message':
      return 'Message';
    case 'announcement':
      return 'Announcement';
    case 'system':
      return 'System';
    default:
      return 'Notification';
  }
}

/**
 * Check if notification is recent (within last hour)
 */
export function isRecentNotification(timestamp: string): boolean {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return new Date(timestamp) > oneHourAgo;
}

/**
 * Sort notifications by priority and date
 */
export function sortNotifications(notifications: any[]) {
  const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
  
  return notifications.sort((a, b) => {
    // First sort by read status (unread first)
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    
    // Then by priority
    const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    // Finally by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * Generate notification sound based on priority
 */
export function getNotificationSound(priority: NotificationPriority): string {
  switch (priority) {
    case 'urgent':
      return '/sounds/urgent-notification.mp3';
    case 'high':
      return '/sounds/high-notification.mp3';
    case 'normal':
      return '/sounds/notification.mp3';
    case 'low':
      return '/sounds/soft-notification.mp3';
    default:
      return '/sounds/notification.mp3';
  }
}

/**
 * Check if user should receive notification based on time
 */
export function shouldSendNotification(userTimezone?: string): boolean {
  // Don't send notifications between 10 PM and 7 AM in user's timezone
  const now = new Date();
  const hour = now.getHours();
  
  // For now, use simple logic. In production, consider user's timezone
  return hour >= 7 && hour < 22;
}

/**
 * Batch notifications by type and time
 */
export function batchNotifications(notifications: any[], timeWindow: number = 5 * 60 * 1000) {
  const batches: Record<string, any[]> = {};
  
  notifications.forEach(notification => {
    const key = `${notification.type}_${Math.floor(new Date(notification.created_at).getTime() / timeWindow)}`;
    if (!batches[key]) {
      batches[key] = [];
    }
    batches[key].push(notification);
  });

  return Object.values(batches);
}
