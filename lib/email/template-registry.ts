/**
 * Email Template Registry
 * Central registry for all email templates with metadata
 */

export interface EmailTemplateMetadata {
  id: string;
  name: string;
  description: string;
  type: 'transactional' | 'marketing';
  category: string;
  requiredVariables: string[];
  optionalVariables: string[];
  defaultSubject: string;
  previewText: string;
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplateMetadata> = {
  'welcome': {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user registers on the platform',
    type: 'transactional',
    category: 'onboarding',
    requiredVariables: ['firstName', 'email'],
    optionalVariables: ['role', 'quickStartUrl'],
    defaultSubject: 'Welcome to Online Education Platform!',
    previewText: 'Get started with your learning journey',
  },
  'email-verification': {
    id: 'email-verification',
    name: 'Email Verification',
    description: 'Sent to verify user email address',
    type: 'transactional',
    category: 'authentication',
    requiredVariables: ['firstName', 'verificationUrl'],
    optionalVariables: ['expiresIn'],
    defaultSubject: 'Verify your email address',
    previewText: 'Please verify your email to activate your account',
  },
  'password-reset': {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Sent when user requests password reset',
    type: 'transactional',
    category: 'authentication',
    requiredVariables: ['firstName', 'resetUrl'],
    optionalVariables: ['expiresIn'],
    defaultSubject: 'Reset your password',
    previewText: 'You requested to reset your password',
  },
  'enrollment-confirmation': {
    id: 'enrollment-confirmation',
    name: 'Enrollment Confirmation',
    description: 'Sent when student enrolls in a course',
    type: 'transactional',
    category: 'courses',
    requiredVariables: ['firstName', 'courseName', 'courseUrl'],
    optionalVariables: ['instructorName', 'startDate'],
    defaultSubject: 'You\'re enrolled in {{courseName}}!',
    previewText: 'Start learning today',
  },
  'payment-receipt': {
    id: 'payment-receipt',
    name: 'Payment Receipt',
    description: 'Sent after successful payment',
    type: 'transactional',
    category: 'payments',
    requiredVariables: ['firstName', 'amount', 'courseName', 'transactionId'],
    optionalVariables: ['invoiceUrl', 'paymentDate'],
    defaultSubject: 'Payment receipt for {{courseName}}',
    previewText: 'Thank you for your purchase',
  },
  'live-class-reminder': {
    id: 'live-class-reminder',
    name: 'Live Class Reminder',
    description: 'Sent before a scheduled live class',
    type: 'transactional',
    category: 'classes',
    requiredVariables: ['firstName', 'className', 'classDate', 'classTime', 'joinUrl'],
    optionalVariables: ['instructorName', 'duration'],
    defaultSubject: 'Reminder: {{className}} starts soon',
    previewText: 'Your class is starting soon',
  },
  'assignment-due-reminder': {
    id: 'assignment-due-reminder',
    name: 'Assignment Due Reminder',
    description: 'Sent when assignment deadline is approaching',
    type: 'transactional',
    category: 'assignments',
    requiredVariables: ['firstName', 'assignmentName', 'dueDate', 'courseName', 'submitUrl'],
    optionalVariables: ['dueTime', 'hoursRemaining'],
    defaultSubject: 'Reminder: {{assignmentName}} is due soon',
    previewText: 'Don\'t forget to submit your assignment',
  },
  'quiz-available': {
    id: 'quiz-available',
    name: 'Quiz Available',
    description: 'Sent when a new quiz becomes available',
    type: 'transactional',
    category: 'assessments',
    requiredVariables: ['firstName', 'quizName', 'courseName', 'quizUrl'],
    optionalVariables: ['availableUntil', 'duration'],
    defaultSubject: 'New quiz available: {{quizName}}',
    previewText: 'A new quiz is ready for you',
  },
  'grade-posted': {
    id: 'grade-posted',
    name: 'Grade Posted',
    description: 'Sent when teacher posts a grade',
    type: 'transactional',
    category: 'grades',
    requiredVariables: ['firstName', 'assignmentName', 'grade', 'courseName'],
    optionalVariables: ['feedback', 'viewUrl'],
    defaultSubject: 'Grade posted for {{assignmentName}}',
    previewText: 'Your grade is now available',
  },
  'certificate-earned': {
    id: 'certificate-earned',
    name: 'Certificate Earned',
    description: 'Sent when student earns a certificate',
    type: 'transactional',
    category: 'achievements',
    requiredVariables: ['firstName', 'courseName', 'certificateUrl'],
    optionalVariables: ['completionDate', 'downloadUrl'],
    defaultSubject: 'Congratulations! You earned a certificate',
    previewText: 'You\'ve completed {{courseName}}',
  },
  'announcement': {
    id: 'announcement',
    name: 'Announcement',
    description: 'General platform announcements',
    type: 'marketing',
    category: 'communications',
    requiredVariables: ['title', 'content'],
    optionalVariables: ['actionUrl', 'actionText'],
    defaultSubject: '{{title}}',
    previewText: 'Important announcement from Online Education Platform',
  },
  'teacher-message': {
    id: 'teacher-message',
    name: 'Teacher Message',
    description: 'Message from teacher to students',
    type: 'transactional',
    category: 'communications',
    requiredVariables: ['firstName', 'teacherName', 'message', 'courseName'],
    optionalVariables: ['replyUrl', 'subject'],
    defaultSubject: 'Message from {{teacherName}}',
    previewText: 'You have a new message from your teacher',
  },
  'parent-weekly-report': {
    id: 'parent-weekly-report',
    name: 'Parent Weekly Report',
    description: 'Weekly progress report for parents',
    type: 'transactional',
    category: 'reports',
    requiredVariables: ['parentName', 'studentName', 'weekStart', 'weekEnd'],
    optionalVariables: ['grades', 'attendance', 'activities'],
    defaultSubject: 'Weekly progress report for {{studentName}}',
    previewText: 'Your child\'s weekly learning summary',
  },
};

/**
 * Get template metadata by ID
 */
export function getTemplateMetadata(templateId: string): EmailTemplateMetadata | null {
  return EMAIL_TEMPLATES[templateId] || null;
}

/**
 * Get all templates by type
 */
export function getTemplatesByType(type: 'transactional' | 'marketing'): EmailTemplateMetadata[] {
  return Object.values(EMAIL_TEMPLATES).filter(t => t.type === type);
}

/**
 * Get all templates by category
 */
export function getTemplatesByCategory(category: string): EmailTemplateMetadata[] {
  return Object.values(EMAIL_TEMPLATES).filter(t => t.category === category);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): string[] {
  const categories = new Set(Object.values(EMAIL_TEMPLATES).map(t => t.category));
  return Array.from(categories);
}

/**
 * Validate template data against required variables
 */
export function validateTemplateVariables(
  templateId: string,
  data: Record<string, any>
): { valid: boolean; missing: string[] } {
  const template = getTemplateMetadata(templateId);
  
  if (!template) {
    return { valid: false, missing: ['Template not found'] };
  }
  
  const missing = template.requiredVariables.filter(variable => {
    return !(variable in data) || data[variable] === null || data[variable] === undefined;
  });
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get template subject with variable injection
 */
export function getTemplateSubject(
  templateId: string,
  data: Record<string, any>
): string {
  const template = getTemplateMetadata(templateId);
  
  if (!template) {
    return 'Notification from Online Education Platform';
  }
  
  let subject = template.defaultSubject;
  
  // Replace variables in subject
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    subject = subject.replace(regex, String(value));
  });
  
  return subject;
}

export default {
  EMAIL_TEMPLATES,
  getTemplateMetadata,
  getTemplatesByType,
  getTemplatesByCategory,
  getTemplateCategories,
  validateTemplateVariables,
  getTemplateSubject,
};
