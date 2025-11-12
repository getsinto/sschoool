import { NotificationTemplate, NotificationType } from '@/types/notification';

export const notificationTemplates: Record<string, NotificationTemplate> = {
  // Course notifications
  'course.new_lesson': {
    type: 'course',
    title: (data) => `New Lesson: ${data.lessonTitle}`,
    message: (data) => `A new lesson "${data.lessonTitle}" has been published in ${data.courseName}.`,
    icon: 'book',
    priority: 'normal',
    action_url: (data) => `/student/courses/${data.courseId}/lessons/${data.lessonId}`
  },
  'course.updated': {
    type: 'course',
    title: (data) => `Course Updated: ${data.courseName}`,
    message: (data) => `${data.courseName} has been updated with new content.`,
    icon: 'refresh',
    priority: 'low',
    action_url: (data) => `/student/courses/${data.courseId}`
  },
  'course.completed': {
    type: 'course',
    title: (data) => `Course Completed! 🎉`,
    message: (data) => `Congratulations! You've completed ${data.courseName}.`,
    icon: 'trophy',
    priority: 'high',
    action_url: (data) => `/student/certificates`
  },

  // Assignment notifications
  'assignment.new': {
    type: 'assignment',
    title: (data) => `New Assignment: ${data.assignmentTitle}`,
    message: (data) => `A new assignment has been posted in ${data.courseName}. Due: ${data.dueDate}`,
    icon: 'clipboard',
    priority: 'normal',
    action_url: (data) => `/student/assignments/${data.assignmentId}`
  },
  'assignment.due_soon': {
    type: 'assignment',
    title: (data) => `Assignment Due Soon!`,
    message: (data) => `"${data.assignmentTitle}" is due in 24 hours.`,
    icon: 'clock',
    priority: 'high',
    action_url: (data) => `/student/assignments/${data.assignmentId}`
  },
  'assignment.graded': {
    type: 'assignment',
    title: (data) => `Assignment Graded`,
    message: (data) => `Your assignment "${data.assignmentTitle}" has been graded. Score: ${data.score}/${data.maxScore}`,
    icon: 'check-circle',
    priority: 'normal',
    action_url: (data) => `/student/assignments/${data.assignmentId}`
  },
  'assignment.late': {
    type: 'assignment',
    title: (data) => `Late Assignment Reminder`,
    message: (data) => `"${data.assignmentTitle}" is overdue. Submit as soon as possible.`,
    icon: 'alert-triangle',
    priority: 'urgent',
    action_url: (data) => `/student/assignments/${data.assignmentId}`
  },

  // Quiz notifications
  'quiz.available': {
    type: 'quiz',
    title: (data) => `New Quiz Available`,
    message: (data) => `"${data.quizTitle}" is now available in ${data.courseName}.`,
    icon: 'file-text',
    priority: 'normal',
    action_url: (data) => `/student/quizzes/${data.quizId}`
  },
  'quiz.graded': {
    type: 'quiz',
    title: (data) => `Quiz Results Posted`,
    message: (data) => `Your quiz "${data.quizTitle}" has been graded. Score: ${data.score}%`,
    icon: 'bar-chart',
    priority: 'normal',
    action_url: (data) => `/student/quizzes/${data.quizId}/results`
  },
  'quiz.failed': {
    type: 'quiz',
    title: (data) => `Quiz Retake Available`,
    message: (data) => `You can retake "${data.quizTitle}". Previous score: ${data.score}%`,
    icon: 'rotate-ccw',
    priority: 'normal',
    action_url: (data) => `/student/quizzes/${data.quizId}`
  },

  // Grade notifications
  'grade.posted': {
    type: 'grade',
    title: (data) => `New Grade Posted`,
    message: (data) => `Grade posted for "${data.itemName}": ${data.grade}`,
    icon: 'award',
    priority: 'normal',
    action_url: (data) => `/student/grades`
  },
  'grade.updated': {
    type: 'grade',
    title: (data) => `Grade Updated`,
    message: (data) => `Your overall grade in ${data.courseName} has been updated to ${data.grade}.`,
    icon: 'trending-up',
    priority: 'normal',
    action_url: (data) => `/student/grades`
  },
  'grade.alert': {
    type: 'grade',
    title: (data) => `Performance Alert`,
    message: (data) => `Your grade in ${data.courseName} is below ${data.threshold}%. Consider seeking help.`,
    icon: 'alert-circle',
    priority: 'high',
    action_url: (data) => `/student/courses/${data.courseId}`
  },

  // Live class notifications
  'live_class.starting_soon': {
    type: 'live_class',
    title: (data) => `Class Starting Soon!`,
    message: (data) => `"${data.className}" starts in 15 minutes.`,
    icon: 'video',
    priority: 'urgent',
    action_url: (data) => `/student/live-classes/${data.classId}`
  },
  'live_class.rescheduled': {
    type: 'live_class',
    title: (data) => `Class Rescheduled`,
    message: (data) => `"${data.className}" has been rescheduled to ${data.newTime}.`,
    icon: 'calendar',
    priority: 'high',
    action_url: (data) => `/student/live-classes`
  },
  'live_class.recording_available': {
    type: 'live_class',
    title: (data) => `Recording Available`,
    message: (data) => `Recording for "${data.className}" is now available.`,
    icon: 'play-circle',
    priority: 'low',
    action_url: (data) => `/student/live-classes/${data.classId}/recording`
  },

  // Payment notifications
  'payment.success': {
    type: 'payment',
    title: (data) => `Payment Successful`,
    message: (data) => `Your payment of $${data.amount} has been processed successfully.`,
    icon: 'check-circle',
    priority: 'normal',
    action_url: (data) => `/student/payments/${data.paymentId}`
  },
  'payment.failed': {
    type: 'payment',
    title: (data) => `Payment Failed`,
    message: (data) => `Your payment of $${data.amount} failed. Please update your payment method.`,
    icon: 'x-circle',
    priority: 'high',
    action_url: (data) => `/student/payments`
  },
  'payment.refund': {
    type: 'payment',
    title: (data) => `Refund Processed`,
    message: (data) => `A refund of $${data.amount} has been processed to your account.`,
    icon: 'dollar-sign',
    priority: 'normal',
    action_url: (data) => `/student/payments/${data.paymentId}`
  },

  // Message notifications
  'message.teacher': {
    type: 'message',
    title: (data) => `New Message from ${data.teacherName}`,
    message: (data) => data.messagePreview,
    icon: 'mail',
    priority: 'normal',
    action_url: (data) => `/student/messages/${data.messageId}`
  },
  'message.admin': {
    type: 'message',
    title: (data) => `Message from Administration`,
    message: (data) => data.messagePreview,
    icon: 'mail',
    priority: 'high',
    action_url: (data) => `/student/messages/${data.messageId}`
  },

  // Announcement notifications
  'announcement.new': {
    type: 'announcement',
    title: (data) => data.title,
    message: (data) => data.preview,
    icon: 'megaphone',
    priority: data.priority || 'normal',
    action_url: (data) => `/announcements/${data.announcementId}`
  },

  // System notifications
  'system.account_verified': {
    type: 'system',
    title: () => `Account Verified`,
    message: () => `Your account has been successfully verified.`,
    icon: 'check-circle',
    priority: 'normal'
  },
  'system.profile_updated': {
    type: 'system',
    title: () => `Profile Updated`,
    message: () => `Your profile has been updated successfully.`,
    icon: 'user',
    priority: 'low'
  },
  'system.certificate_earned': {
    type: 'system',
    title: (data) => `Certificate Earned! 🎓`,
    message: (data) => `You've earned a certificate for completing ${data.courseName}.`,
    icon: 'award',
    priority: 'high',
    action_url: (data) => `/student/certificates/${data.certificateId}`
  },
  'system.badge_unlocked': {
    type: 'system',
    title: (data) => `Badge Unlocked! 🏆`,
    message: (data) => `You've unlocked the "${data.badgeName}" badge!`,
    icon: 'star',
    priority: 'normal',
    action_url: () => `/student/achievements`
  }
};

export function getNotificationTemplate(templateKey: string): NotificationTemplate | null {
  return notificationTemplates[templateKey] || null;
}

export function generateNotification(templateKey: string, data: any) {
  const template = getNotificationTemplate(templateKey);
  if (!template) {
    throw new Error(`Notification template "${templateKey}" not found`);
  }

  return {
    type: template.type,
    title: template.title(data),
    message: template.message(data),
    icon: template.icon,
    priority: template.priority,
    action_url: template.action_url ? template.action_url(data) : undefined,
    data
  };
}
