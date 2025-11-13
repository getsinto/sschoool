/**
 * Email Template Development Helpers
 * Utilities for developing and testing email templates
 */

import { ReactElement } from 'react';
import { renderEmailTemplate, renderEmailTemplatePlainText } from './template-renderer';
import { getTemplateMetadata, validateTemplateVariables } from './template-registry';

/**
 * Generate sample data for template testing
 */
export function generateSampleData(templateId: string): Record<string, any> {
  const sampleData: Record<string, Record<string, any>> = {
    'welcome': {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'student',
      quickStartUrl: 'https://example.com/quick-start',
    },
    'email-verification': {
      firstName: 'Jane',
      verificationUrl: 'https://example.com/verify?token=abc123',
      expiresIn: '24 hours',
    },
    'password-reset': {
      firstName: 'Bob',
      resetUrl: 'https://example.com/reset?token=xyz789',
      expiresIn: '1 hour',
    },
    'enrollment-confirmation': {
      firstName: 'Alice',
      courseName: 'Introduction to Web Development',
      courseUrl: 'https://example.com/courses/web-dev-101',
      instructorName: 'Dr. Smith',
      startDate: 'January 15, 2024',
    },
    'payment-receipt': {
      firstName: 'Charlie',
      amount: '$99.99',
      courseName: 'Advanced JavaScript',
      transactionId: 'TXN-123456',
      invoiceUrl: 'https://example.com/invoices/123456',
      paymentDate: 'December 1, 2023',
    },
    'live-class-reminder': {
      firstName: 'David',
      className: 'React Fundamentals - Session 3',
      classDate: 'Monday, December 18, 2023',
      classTime: '2:00 PM EST',
      joinUrl: 'https://example.com/classes/join/abc123',
      instructorName: 'Prof. Johnson',
      duration: '90 minutes',
    },
    'assignment-due-reminder': {
      firstName: 'Emma',
      assignmentName: 'Final Project Submission',
      dueDate: 'Friday, December 22, 2023',
      dueTime: '11:59 PM',
      courseName: 'Web Development Bootcamp',
      submitUrl: 'https://example.com/assignments/submit/456',
      hoursRemaining: '24',
    },
    'quiz-available': {
      firstName: 'Frank',
      quizName: 'Module 3 Assessment',
      courseName: 'Data Structures and Algorithms',
      quizUrl: 'https://example.com/quizzes/789',
      availableUntil: 'December 20, 2023',
      duration: '45 minutes',
    },
    'grade-posted': {
      firstName: 'Grace',
      assignmentName: 'Midterm Exam',
      grade: 'A (95%)',
      courseName: 'Computer Science 101',
      feedback: 'Excellent work! Your understanding of the concepts is clear.',
      viewUrl: 'https://example.com/grades/view/123',
    },
    'certificate-earned': {
      firstName: 'Henry',
      courseName: 'Full Stack Web Development',
      certificateUrl: 'https://example.com/certificates/view/abc123',
      completionDate: 'December 15, 2023',
      downloadUrl: 'https://example.com/certificates/download/abc123',
    },
    'announcement': {
      title: 'Platform Maintenance Scheduled',
      content: 'We will be performing scheduled maintenance on Saturday, December 16th from 2:00 AM to 6:00 AM EST. The platform will be temporarily unavailable during this time.',
      actionUrl: 'https://example.com/announcements/maintenance',
      actionText: 'Learn More',
    },
    'teacher-message': {
      firstName: 'Ivy',
      teacherName: 'Dr. Williams',
      message: 'Great job on your recent assignment! I\'d like to discuss your project ideas during office hours.',
      courseName: 'Advanced Programming',
      replyUrl: 'https://example.com/messages/reply/789',
      subject: 'Office Hours Discussion',
    },
    'parent-weekly-report': {
      parentName: 'Mr. Johnson',
      studentName: 'Tommy Johnson',
      weekStart: 'December 11, 2023',
      weekEnd: 'December 15, 2023',
      grades: [
        { course: 'Mathematics', grade: 'A-', assignment: 'Chapter 5 Test' },
        { course: 'Science', grade: 'B+', assignment: 'Lab Report' },
      ],
      attendance: '100%',
      activities: [
        'Completed 3 assignments',
        'Attended 2 live classes',
        'Participated in group discussion',
      ],
    },
  };

  return sampleData[templateId] || {};
}

/**
 * Preview email template with sample data
 */
export async function previewTemplate(
  templateId: string,
  customData?: Record<string, any>
): Promise<{ html: string; plainText: string; metadata: any }> {
  const metadata = getTemplateMetadata(templateId);
  
  if (!metadata) {
    throw new Error(`Template ${templateId} not found`);
  }

  const data = customData || generateSampleData(templateId);
  
  // Validate data
  const validation = validateTemplateVariables(templateId, data);
  if (!validation.valid) {
    console.warn('Missing required variables:', validation.missing);
  }

  // Import and render template
  const templateModule = await import(`@/emails/${getTemplateFileName(templateId)}`);
  const TemplateComponent = templateModule.default;
  const template = TemplateComponent(data);

  const html = await renderEmailTemplate(template);
  const plainText = await renderEmailTemplatePlainText(template);

  return {
    html,
    plainText,
    metadata: {
      ...metadata,
      validation,
      data,
    },
  };
}

/**
 * Test email template rendering
 */
export async function testTemplate(templateId: string): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const metadata = getTemplateMetadata(templateId);
    
    if (!metadata) {
      errors.push(`Template ${templateId} not found in registry`);
      return { success: false, errors, warnings };
    }

    // Test with sample data
    const sampleData = generateSampleData(templateId);
    const validation = validateTemplateVariables(templateId, sampleData);
    
    if (!validation.valid) {
      warnings.push(`Missing required variables: ${validation.missing.join(', ')}`);
    }

    // Try to render template
    try {
      await previewTemplate(templateId, sampleData);
    } catch (error) {
      errors.push(`Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, errors, warnings };
  }
}

/**
 * Get template file name from template ID
 */
function getTemplateFileName(templateId: string): string {
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

  return templateMap[templateId] || 'WelcomeEmail';
}

/**
 * List all available templates
 */
export function listTemplates(): Array<{
  id: string;
  name: string;
  type: string;
  category: string;
}> {
  const { EMAIL_TEMPLATES } = require('./template-registry');
  
  return Object.values(EMAIL_TEMPLATES).map((template: any) => ({
    id: template.id,
    name: template.name,
    type: template.type,
    category: template.category,
  }));
}

export default {
  generateSampleData,
  previewTemplate,
  testTemplate,
  listTemplates,
};
