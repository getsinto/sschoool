import { NotificationType, NotificationTemplate } from './types';

/**
 * Notification templates for different types of notifications
 */
export const notificationTemplates: Record<NotificationType, NotificationTemplate> = {
  course: {
    type: 'course',
    title: 'Course Update',
    message: 'You have a new update in {{courseName}}',
    priority: 'normal',
    variables: ['courseName', 'updateType']
  },
  assignment: {
    type: 'assignment',
    title: 'New Assignment',
    message: 'New assignment "{{assignmentTitle}}" has been posted in {{courseName}}',
    priority: 'high',
    variables: ['assignmentTitle', 'courseName', 'dueDate']
  },
  grade: {
    type: 'grade',
    title: 'Grade Posted',
    message: 'Your grade for "{{itemName}}" has been posted: {{grade}}',
    priority: 'normal',
    variables: ['itemName', 'grade', 'courseName']
  },
  'live-class': {
    type: 'live-class',
    title: 'Live Class Reminder',
    message: 'Your live class "{{className}}" starts in {{timeUntil}}',
    priority: 'urgent',
    variables: ['className', 'timeUntil', 'meetingLink']
  },
  payment: {
    type: 'payment',
    title: 'Payment Update',
    message: 'Payment {{status}} for {{itemName}}',
    priority: 'high',
    variables: ['status', 'itemName', 'amount']
  },
  message: {
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from {{senderName}}',
    priority: 'normal',
    variables: ['senderName', 'preview']
  },
  announcement: {
    type: 'announcement',
    title: 'New Announcement',
    message: '{{announcementTitle}}',
    priority: 'high',
    variables: ['announcementTitle', 'preview']
  },
  system: {
    type: 'system',
    title: 'System Notification',
    message: '{{message}}',
    priority: 'normal',
    variables: ['message']
  }
};

/**
 * Replace template variables with actual values
 */
export function renderTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let rendered = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value));
  });
  
  return rendered;
}

/**
 * Create notification from template
 */
export function createNotificationFromTemplate(
  type: NotificationType,
  variables: Record<string, any>,
  customTitle?: string,
  customMessage?: string
): { title: string; message: string; priority: string } {
  const template = notificationTemplates[type];
  
  return {
    title: customTitle || renderTemplate(template.title, variables),
    message: customMessage || renderTemplate(template.message, variables),
    priority: template.priority
  };
}

/**
 * Specific notification creators
 */

export function createCourseNotification(data: {
  courseName: string;
  updateType: string;
  customMessage?: string;
}) {
  return createNotificationFromTemplate('course', data, undefined, data.customMessage);
}

export function createAssignmentNotification(data: {
  assignmentTitle: string;
  courseName: string;
  dueDate: string;
}) {
  return createNotificationFromTemplate('assignment', data);
}

export function createGradeNotification(data: {
  itemName: string;
  grade: string;
  courseName: string;
}) {
  return createNotificationFromTemplate('grade', data);
}

export function createLiveClassNotification(data: {
  className: string;
  timeUntil: string;
  meetingLink: string;
}) {
  return createNotificationFromTemplate('live-class', data);
}

export function createPaymentNotification(data: {
  status: string;
  itemName: string;
  amount: string;
}) {
  return createNotificationFromTemplate('payment', data);
}

export function createMessageNotification(data: {
  senderName: string;
  preview: string;
}) {
  return createNotificationFromTemplate('message', data);
}

export function createAnnouncementNotification(data: {
  announcementTitle: string;
  preview: string;
}) {
  return createNotificationFromTemplate('announcement', data);
}

export function createSystemNotification(data: {
  message: string;
}) {
  return createNotificationFromTemplate('system', data);
}
