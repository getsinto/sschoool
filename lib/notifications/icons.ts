import { NotificationType } from '@/types/notification';

/**
 * Icon mappings for notification types
 */
export const notificationIcons: Record<NotificationType, string> = {
  course: 'book-open',
  assignment: 'clipboard-list',
  quiz: 'file-text',
  grade: 'award',
  live_class: 'video',
  payment: 'credit-card',
  message: 'mail',
  announcement: 'megaphone',
  system: 'settings'
};

/**
 * Get icon name for notification type
 */
export function getNotificationIcon(type: NotificationType, icon?: string): string {
  return icon || notificationIcons[type] || 'bell';
}

/**
 * Priority icons
 */
export const priorityIcons = {
  urgent: 'alert-triangle',
  high: 'alert-circle',
  normal: 'info',
  low: 'minus-circle'
};

/**
 * Status icons
 */
export const statusIcons = {
  unread: 'circle',
  read: 'check-circle',
  archived: 'archive'
};

/**
 * Action icons
 */
export const actionIcons = {
  view: 'eye',
  delete: 'trash-2',
  markRead: 'check',
  markUnread: 'circle',
  archive: 'archive',
  reply: 'reply',
  forward: 'forward'
};
