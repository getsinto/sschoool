import { Resend } from 'resend';
import { SendEmailOptions, EmailAttachment } from '@/types/email';

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Online Education Platform';

// Lazy initialize Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY || 'dummy_key_for_build';
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export class EmailService {
  /**
   * Send a single email
   */
  static async sendEmail(options: SendEmailOptions): Promise<{ id: string; success: boolean; error?: string }> {
    try {
      const { to, subject, template, data, attachments } = options;

      // Import the email template dynamically
      const emailTemplate = await this.getEmailTemplate(template, data);

      const resend = getResendClient();
      const response = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        react: emailTemplate,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
        })),
      });

      if (response.error) {
        console.error('Email send error:', response.error);
        return {
          id: '',
          success: false,
          error: response.error.message,
        };
      }

      return {
        id: response.data?.id || '',
        success: true,
      };
    } catch (error) {
      console.error('Email service error:', error);
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send bulk emails
   */
  static async sendBulkEmails(
    recipients: string[],
    subject: string,
    template: string,
    data: Record<string, any>
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    const results = {
      success: true,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const promises = batch.map(async (recipient) => {
        const result = await this.sendEmail({
          to: recipient,
          subject,
          template: template as any,
          data,
        });

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`${recipient}: ${result.error}`);
        }
      });

      await Promise.all(promises);

      // Add delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    results.success = results.failed === 0;
    return results;
  }

  /**
   * Send email with attachments
   */
  static async sendEmailWithAttachments(
    to: string,
    subject: string,
    template: string,
    data: Record<string, any>,
    attachments: EmailAttachment[]
  ): Promise<{ success: boolean; error?: string }> {
    const result = await this.sendEmail({
      to,
      subject,
      template: template as any,
      data,
      attachments,
    });

    return {
      success: result.success,
      error: result.error,
    };
  }

  /**
   * Get email template component
   */
  private static async getEmailTemplate(template: string, data: Record<string, any>): Promise<any> {
    try {
      // Validate template data
      const { validateTemplateVariables } = await import('./template-registry');
      const validation = validateTemplateVariables(template, data);
      
      if (!validation.valid) {
        console.warn(`Missing required variables for template ${template}:`, validation.missing);
      }

      // Personalize content with user info
      const { personalizeContent } = await import('./template-renderer');
      const personalizedData = personalizeContent(data, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      });

      // Dynamically import the email template
      const templateModule = await import(`@/emails/${this.getTemplateFileName(template)}`);
      const TemplateComponent = templateModule.default;
      return TemplateComponent(personalizedData);
    } catch (error) {
      console.error(`Failed to load email template: ${template}`, error);
      throw new Error(`Email template not found: ${template}`);
    }
  }

  /**
   * Map template name to file name
   */
  private static getTemplateFileName(template: string): string {
    const templateMap: Record<string, string> = {
      'welcome': 'WelcomeEmail',
      'email-verification': 'EmailVerification',
      'password-reset': 'PasswordReset',
      'enrollment-confirmation': 'EnrollmentConfirmation',
      'payment-receipt': 'PaymentReceipt',
      'live-class-reminder': 'LiveClassReminder',
      'assignment-due-reminder': 'AssignmentDueReminder',
      'quiz-available': 'QuizAvailable',
      'grade-posted': 'GradePosted',
      'certificate-earned': 'CertificateEarned',
      'announcement': 'Announcement',
      'teacher-message': 'TeacherMessage',
      'parent-weekly-report': 'ParentWeeklyReport',
    };

    return templateMap[template] || 'WelcomeEmail';
  }

  /**
   * Track email status (webhook handler will update this)
   */
  static async trackEmailStatus(emailId: string): Promise<any> {
    try {
      // This would typically query your database for email analytics
      // For now, return a placeholder
      return {
        id: emailId,
        status: 'sent',
      };
    } catch (error) {
      console.error('Failed to track email status:', error);
      return null;
    }
  }
}

// Export sendEmail as a standalone function for convenience
export const sendEmail = EmailService.sendEmail.bind(EmailService);

export default EmailService;
