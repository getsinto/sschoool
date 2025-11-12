// Email notification types for the platform

export type EmailTemplateType = 
  | 'welcome'
  | 'email-verification'
  | 'password-reset'
  | 'enrollment-confirmation'
  | 'payment-receipt'
  | 'live-class-reminder'
  | 'assignment-due-reminder'
  | 'quiz-available'
  | 'grade-posted'
  | 'certificate-earned'
  | 'announcement'
  | 'teacher-message'
  | 'parent-weekly-report';

export type EmailCategory = 
  | 'course-updates'
  | 'live-class-reminders'
  | 'assignment-reminders'
  | 'grade-notifications'
  | 'payment-receipts'
  | 'announcements'
  | 'messages'
  | 'marketing';

export type EmailFrequency = 'immediate' | 'daily' | 'weekly' | 'never';

export type EmailStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'bounced';

export interface EmailJob {
  id: string;
  template: EmailTemplateType;
  recipient: string;
  subject: string;
  data: Record<string, any>;
  scheduled_at?: string;
  status: EmailStatus;
  attempts: number;
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'transactional' | 'marketing';
  subject: string;
  component: string;
  description: string;
  variables: string[];
  created_at: string;
}

export interface EmailAnalytics {
  id: string;
  email_job_id: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  bounce_type?: 'hard' | 'soft';
  bounce_reason?: string;
  unsubscribed_at?: string;
  complained_at?: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  category: EmailCategory;
  enabled: boolean;
  frequency: EmailFrequency;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template: EmailTemplateType;
  segment: string;
  scheduled_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  created_by: string;
  created_at: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: EmailTemplateType;
  data: Record<string, any>;
  attachments?: EmailAttachment[];
  scheduledAt?: Date;
  priority?: 'high' | 'normal' | 'low';
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface BulkEmailOptions {
  recipients: string[];
  subject: string;
  template: EmailTemplateType;
  data: Record<string, any>;
  batchSize?: number;
}

export interface EmailQueueJob {
  id: string;
  type: 'single' | 'bulk' | 'scheduled';
  payload: SendEmailOptions | BulkEmailOptions;
  priority: number;
  attempts: number;
  maxAttempts: number;
  status: EmailStatus;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}
