/**
 * Email Service
 * Main entry point for sending emails
 */

import { SendEmailOptions } from '@/types/email';
import { EmailService } from './resend';

/**
 * Send an email using the configured email service
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ id: string; success: boolean; error?: string }> {
  return EmailService.sendEmail(options);
}

/**
 * Send bulk emails to multiple recipients
 */
export async function sendBulkEmails(
  recipients: string[],
  subject: string,
  template: string,
  data: Record<string, any>
): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
  return EmailService.sendBulkEmails(recipients, subject, template, data);
}

/**
 * Send email with attachments
 */
export async function sendEmailWithAttachments(
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>,
  attachments: Array<{ filename: string; content: Buffer | string }>
): Promise<{ success: boolean; error?: string }> {
  return EmailService.sendEmailWithAttachments(to, subject, template, data, attachments);
}

export default {
  sendEmail,
  sendBulkEmails,
  sendEmailWithAttachments
};
