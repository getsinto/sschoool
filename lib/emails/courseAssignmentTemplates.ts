/**
 * Course Assignment Email Templates Integration
 * Feature: course-assignment-permissions
 * 
 * Integrates email templates with the notification delivery system
 * Requirements: 11.1-11.4
 */

import * as React from 'react';
import { Resend } from 'resend';
import { TeacherAssignedEmail } from '../../emails/TeacherAssigned';
import { TeacherUnassignedEmail } from '../../emails/TeacherUnassigned';
import { PermissionsUpdatedEmail } from '../../emails/PermissionsUpdated';

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

// Types for email data
export interface TeacherAssignmentData {
  teacherName: string;
  teacherEmail: string;
  courseName: string;
  courseDescription?: string;
  assignedBy: string;
  assignedDate: string;
  permissions: {
    can_manage_content: boolean;
    can_grade: boolean;
    can_communicate: boolean;
    is_primary_teacher: boolean;
  };
  courseUrl: string;
  dashboardUrl: string;
  supportUrl: string;
}

export interface TeacherUnassignmentData {
  teacherName: string;
  teacherEmail: string;
  courseName: string;
  courseDescription?: string;
  removedBy: string;
  removalDate: string;
  removalReason?: string;
  wasActive: boolean;
  studentCount?: number;
  dashboardUrl: string;
  supportUrl: string;
  feedbackUrl?: string;
}

export interface PermissionUpdateData {
  teacherName: string;
  teacherEmail: string;
  courseName: string;
  courseDescription?: string;
  updatedBy: string;
  updateDate: string;
  updateReason?: string;
  permissionChanges: Array<{
    permission: string;
    label: string;
    oldValue: boolean;
    newValue: boolean;
    description: string;
  }>;
  newRole: 'primary' | 'assistant';
  oldRole: 'primary' | 'assistant';
  courseUrl: string;
  dashboardUrl: string;
  supportUrl: string;
}

/**
 * Send teacher assignment notification email
 */
export async function sendTeacherAssignedEmail(data: TeacherAssignmentData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    
    const response = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: data.teacherEmail,
      subject: `You've been assigned to teach ${data.courseName}`,
      react: TeacherAssignedEmail(data),
    });

    if (response.error) {
      console.error('Email send error:', response.error);
      return {
        success: false,
        error: response.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending teacher assigned email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Send teacher unassignment notification email
 */
export async function sendTeacherUnassignedEmail(data: TeacherUnassignmentData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    
    const response = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: data.teacherEmail,
      subject: `Course assignment update: ${data.courseName}`,
      react: TeacherUnassignedEmail(data),
    });

    if (response.error) {
      console.error('Email send error:', response.error);
      return {
        success: false,
        error: response.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending teacher unassigned email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Send permission update notification email
 */
export async function sendPermissionsUpdatedEmail(data: PermissionUpdateData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    
    const response = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: data.teacherEmail,
      subject: `Permission update for ${data.courseName}`,
      react: PermissionsUpdatedEmail(data),
    });

    if (response.error) {
      console.error('Email send error:', response.error);
      return {
        success: false,
        error: response.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending permissions updated email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Generate plain text version of emails for accessibility
 */
function generatePlainTextVersion(
  data: TeacherAssignmentData | TeacherUnassignmentData | PermissionUpdateData, 
  type: 'assigned' | 'unassigned' | 'permissions_updated'
): string {
  const commonInfo = `\nCourse: ${data.courseName}\n${data.courseDescription ? `Description: ${data.courseDescription}\n` : ''}`;

  switch (type) {
    case 'assigned':
      const assignData = data as TeacherAssignmentData;
      return `Hello ${assignData.teacherName},

You have been assigned to teach a new course.
${commonInfo}
Assigned by: ${assignData.assignedBy}
Assignment Date: ${assignData.assignedDate}
Role: ${assignData.permissions.is_primary_teacher ? 'Primary Teacher' : 'Assistant Teacher'}

Your Permissions:
- Content Management: ${assignData.permissions.can_manage_content ? 'Yes' : 'No'}
- Grading: ${assignData.permissions.can_grade ? 'Yes' : 'No'}
- Communication: ${assignData.permissions.can_communicate ? 'Yes' : 'No'}

View Course: ${assignData.courseUrl}
Dashboard: ${assignData.dashboardUrl}

Best regards,
The EduPlatform Team`;

    case 'unassigned':
      const unassignData = data as TeacherUnassignmentData;
      return `Hello ${unassignData.teacherName},

Your assignment to the following course has been updated.
${commonInfo}
Removed by: ${unassignData.removedBy}
Removal Date: ${unassignData.removalDate}
${unassignData.removalReason ? `Reason: ${unassignData.removalReason}\n` : ''}
You no longer have access to this course.

Dashboard: ${unassignData.dashboardUrl}

Thank you for your dedication to teaching,
The EduPlatform Team`;

    case 'permissions_updated':
      const updateData = data as PermissionUpdateData;
      const changedPermissions = updateData.permissionChanges
        .filter(change => change.oldValue !== change.newValue)
        .map(change => `- ${change.label}: ${change.oldValue ? 'Had access' : 'No access'} → ${change.newValue ? 'Now has access' : 'Access removed'}`)
        .join('\n');
      
      return `Hello ${updateData.teacherName},

Your teaching permissions for the following course have been updated.
${commonInfo}
Updated by: ${updateData.updatedBy}
Update Date: ${updateData.updateDate}
${updateData.updateReason ? `Reason: ${updateData.updateReason}\n` : ''}
Current Role: ${updateData.newRole === 'primary' ? 'Primary Teacher' : 'Assistant Teacher'}

Permission Changes:
${changedPermissions}

View Course: ${updateData.courseUrl}
Dashboard: ${updateData.dashboardUrl}

Best regards,
The EduPlatform Team`;

    default:
      return `Hello ${data.teacherName},

Your course assignment has been updated.
${commonInfo}

Best regards,
The EduPlatform Team`;
  }
}

/**
 * Batch send multiple assignment notifications
 */
export async function sendBatchAssignmentEmails(
  assignments: TeacherAssignmentData[]
): Promise<{ success: boolean; results: Array<{ email: string; success: boolean; error?: string }> }> {
  const results = await Promise.allSettled(
    assignments.map(async (assignment) => ({
      email: assignment.teacherEmail,
      ...(await sendTeacherAssignedEmail(assignment))
    }))
  );

  const processedResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      const error = result.reason;
      const assignment = assignments[index];
      return {
        email: assignment?.teacherEmail || 'unknown',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  const allSuccessful = processedResults.every(result => result.success);

  return {
    success: allSuccessful,
    results: processedResults
  };
}

/**
 * Get email template preview (for testing/admin preview)
 * Returns the React component for rendering
 */
export function getEmailPreview(
  type: 'assigned' | 'unassigned' | 'permissions_updated',
  data: TeacherAssignmentData | TeacherUnassignmentData | PermissionUpdateData
): React.ReactElement {
  switch (type) {
    case 'assigned':
      return TeacherAssignedEmail(data as TeacherAssignmentData);
    case 'unassigned':
      return TeacherUnassignedEmail(data as TeacherUnassignmentData);
    case 'permissions_updated':
      return PermissionsUpdatedEmail(data as PermissionUpdateData);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}


/**
 * Send course deletion notification to assigned teachers
 */
export async function sendCourseDeletedEmail(
  teacherEmail: string,
  teacherName: string,
  courseTitle: string,
  deletedBy: string,
  reason?: string
) {
  try {
    const { render } = await import('@react-email/render')
    const CourseDeletedEmail = (await import('@/emails/CourseDeleted')).default

    const emailHtml = render(
      CourseDeletedEmail({
        teacherName,
        courseTitle,
        deletedBy,
        deletedAt: new Date().toLocaleDateString(),
        reason,
      })
    )

    // Send email using your email service
    // This is a placeholder - integrate with your actual email service
    console.log(`Sending course deletion email to ${teacherEmail}`)
    
    // Example with a hypothetical email service:
    // await emailService.send({
    //   to: teacherEmail,
    //   subject: `Course Deleted: ${courseTitle}`,
    //   html: emailHtml,
    // })

    return { success: true }
  } catch (error) {
    console.error('Error sending course deleted email:', error)
    return { success: false, error }
  }
}
