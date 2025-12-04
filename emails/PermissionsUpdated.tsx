/**
 * Email Template: Teacher Permissions Updated
 * Feature: course-assignment-permissions
 * 
 * Sent when a teacher's permissions for a course are modified
 * Requirements: 11.1, 11.4
 */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PermissionChange {
  permission: string;
  label: string;
  oldValue: boolean;
  newValue: boolean;
  description: string;
}

interface PermissionsUpdatedEmailProps {
  teacherName: string;
  courseName: string;
  courseDescription?: string;
  updatedBy: string;
  updateDate: string;
  updateReason?: string;
  permissionChanges: PermissionChange[];
  newRole: 'primary' | 'assistant';
  oldRole: 'primary' | 'assistant';
  courseUrl: string;
  dashboardUrl: string;
  supportUrl: string;
}

export const PermissionsUpdatedEmail = ({
  teacherName = 'John Doe',
  courseName = 'Introduction to Mathematics',
  courseDescription = 'A comprehensive course covering fundamental mathematical concepts.',
  updatedBy = 'Admin User',
  updateDate = 'January 2, 2025',
  updateReason,
  permissionChanges = [
    {
      permission: 'can_manage_content',
      label: 'Content Management',
      oldValue: false,
      newValue: true,
      description: 'Create, edit, and organize course content'
    }
  ],
  newRole = 'assistant',
  oldRole = 'assistant',
  courseUrl = 'https://app.example.com/teacher/courses/123',
  dashboardUrl = 'https://app.example.com/teacher/dashboard',
  supportUrl = 'https://app.example.com/support',
}: PermissionsUpdatedEmailProps) => {
  const previewText = `Your permissions for ${courseName} have been updated`;
  const roleChanged = newRole !== oldRole;
  const hasPermissionChanges = permissionChanges.some(change => change.oldValue !== change.newValue);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://app.example.com/logo.png"
              width="120"
              height="36"
              alt="EduPlatform"
              style={logo}
            />
          </Section>
          
          <Section style={content}>
            <Heading style={h1}>Permission Update Notification</Heading>
            
            <Text style={text}>
              Hello {teacherName},
            </Text>
            
            <Text style={text}>
              Your teaching permissions for the following course have been updated:
            </Text>
            
            <Section style={courseInfo}>
              <Heading style={h2}>{courseName}</Heading>
              {courseDescription && (
                <Text style={description}>{courseDescription}</Text>
              )}
              
              <Text style={metadata}>
                <strong>Updated by:</strong> {updatedBy}<br />
                <strong>Update Date:</strong> {updateDate}<br />
                <strong>Current Role:</strong> {newRole === 'primary' ? 'Primary Teacher' : 'Assistant Teacher'}
                {roleChanged && (
                  <><br /><strong>Previous Role:</strong> {oldRole === 'primary' ? 'Primary Teacher' : 'Assistant Teacher'}</>
                )}
              </Text>
            </Section>
            
            {updateReason && (
              <Section style={reasonSection}>
                <Heading style={h3}>Reason for Update</Heading>
                <Text style={reasonText}>{updateReason}</Text>
              </Section>
            )}
            
            {hasPermissionChanges && (
              <Section style={permissionsSection}>
                <Heading style={h3}>Permission Changes</Heading>
                <Text style={text}>
                  The following permissions have been updated:
                </Text>
                
                {permissionChanges.map((change, index) => {
                  const isChanged = change.oldValue !== change.newValue;
                  if (!isChanged) return null;
                  
                  return (
                    <Section key={index} style={permissionChange}>
                      <div style={permissionHeader}>
                        <span style={change.newValue ? permissionGranted : permissionRevoked}>
                          {change.newValue ? '✓ GRANTED' : '✗ REVOKED'}
                        </span>
                        <strong style={permissionLabel}>{change.label}</strong>
                      </div>
                      <Text style={permissionDescription}>
                        {change.description}
                      </Text>
                      <Text style={permissionStatus}>
                        Status: {change.oldValue ? 'Had access' : 'No access'} → {change.newValue ? 'Now has access' : 'Access removed'}
                      </Text>
                    </Section>
                  );
                })}
              </Section>
            )}
            
            <Section style={actionSection}>
              <Button style={button} href={courseUrl}>
                View Course
              </Button>
              
              <Text style={text}>
                You can access your updated course permissions from your{' '}
                <Link href={dashboardUrl} style={link}>
                  teacher dashboard
                </Link>
                .
              </Text>
            </Section>
            
            <Section style={supportSection}>
              <Text style={text}>
                If you have any questions about these permission changes, please{' '}
                <Link href={supportUrl} style={link}>
                  contact our support team
                </Link>
                .
              </Text>
            </Section>
            
            <Text style={signature}>
              Best regards,<br />
              The EduPlatform Team
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent to you because your course permissions were updated on EduPlatform.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PermissionsUpdatedEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoContainer = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const h3 = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '24px 0 16px',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const courseInfo = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const description = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
};

const metadata = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const reasonSection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const reasonText = {
  color: '#92400e',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontStyle: 'italic',
};

const permissionsSection = {
  margin: '32px 0',
};

const permissionChange = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '16px',
  margin: '12px 0',
};

const permissionHeader = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
};

const permissionGranted = {
  color: '#10b981',
  fontSize: '12px',
  fontWeight: 'bold',
  backgroundColor: '#d1fae5',
  padding: '4px 8px',
  borderRadius: '4px',
  marginRight: '12px',
};

const permissionRevoked = {
  color: '#ef4444',
  fontSize: '12px',
  fontWeight: 'bold',
  backgroundColor: '#fee2e2',
  padding: '4px 8px',
  borderRadius: '4px',
  marginRight: '12px',
};

const permissionLabel = {
  color: '#1f2937',
  fontSize: '16px',
};

const permissionDescription = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
};

const permissionStatus = {
  color: '#4b5563',
  fontSize: '12px',
  fontStyle: 'italic',
  margin: '4px 0 0',
};

const actionSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 0 16px',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const supportSection = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '16px',
  margin: '32px 0',
};

const signature = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  padding: '32px 48px 0',
  margin: '32px 0 0',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};
