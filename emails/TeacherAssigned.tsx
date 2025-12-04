/**
 * Email Template: Teacher Assigned to Course
 * Feature: course-assignment-permissions
 * 
 * Sent when a teacher is assigned to a course by an admin
 * Requirements: 11.1, 11.2
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

interface TeacherAssignedEmailProps {
  teacherName: string;
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

export const TeacherAssignedEmail = ({
  teacherName = 'John Doe',
  courseName = 'Introduction to Mathematics',
  courseDescription = 'A comprehensive course covering fundamental mathematical concepts.',
  assignedBy = 'Admin User',
  assignedDate = 'January 2, 2025',
  permissions = {
    can_manage_content: true,
    can_grade: true,
    can_communicate: true,
    is_primary_teacher: false,
  },
  courseUrl = 'https://app.example.com/teacher/courses/123',
  dashboardUrl = 'https://app.example.com/teacher/dashboard',
  supportUrl = 'https://app.example.com/support',
}: TeacherAssignedEmailProps) => {
  const previewText = `You've been assigned to teach ${courseName}`;

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
            <Heading style={h1}>Course Assignment Notification</Heading>
            
            <Text style={text}>
              Hello {teacherName},
            </Text>
            
            <Text style={text}>
              Great news! You have been assigned to teach a new course. Here are the details:
            </Text>
            
            <Section style={courseInfo}>
              <Heading style={h2}>{courseName}</Heading>
              {courseDescription && (
                <Text style={description}>{courseDescription}</Text>
              )}
              
              <Text style={metadata}>
                <strong>Assigned by:</strong> {assignedBy}<br />
                <strong>Assignment Date:</strong> {assignedDate}<br />
                <strong>Role:</strong> {permissions.is_primary_teacher ? 'Primary Teacher' : 'Assistant Teacher'}
              </Text>
            </Section>
            
            <Section style={permissionsSection}>
              <Heading style={h3}>Your Permissions</Heading>
              <Text style={text}>
                You have been granted the following permissions for this course:
              </Text>
              
              <ul style={permissionsList}>
                <li style={permissionItem}>
                  <span style={permissions.can_manage_content ? permissionGranted : permissionDenied}>
                    {permissions.can_manage_content ? '✓' : '✗'}
                  </span>
                  <strong>Content Management:</strong> {permissions.can_manage_content ? 'You can create, edit, and organize course content' : 'View-only access to course content'}
                </li>
                <li style={permissionItem}>
                  <span style={permissions.can_grade ? permissionGranted : permissionDenied}>
                    {permissions.can_grade ? '✓' : '✗'}
                  </span>
                  <strong>Grading:</strong> {permissions.can_grade ? 'You can grade assignments and provide feedback' : 'No grading permissions'}
                </li>
                <li style={permissionItem}>
                  <span style={permissions.can_communicate ? permissionGranted : permissionDenied}>
                    {permissions.can_communicate ? '✓' : '✗'}
                  </span>
                  <strong>Communication:</strong> {permissions.can_communicate ? 'You can message students and parents' : 'No communication permissions'}
                </li>
              </ul>
            </Section>
            
            <Section style={actionSection}>
              <Button style={button} href={courseUrl}>
                View Course
              </Button>
              
              <Text style={text}>
                You can also access your course from your{' '}
                <Link href={dashboardUrl} style={link}>
                  teacher dashboard
                </Link>
                .
              </Text>
            </Section>
            
            <Section style={supportSection}>
              <Text style={text}>
                If you have any questions or need assistance, please{' '}
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
              This email was sent to you because you were assigned to a course on EduPlatform.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TeacherAssignedEmail;

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
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
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

const permissionsSection = {
  margin: '32px 0',
};

const permissionsList = {
  margin: '16px 0',
  padding: '0',
  listStyle: 'none',
};

const permissionItem = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '12px 0',
  padding: '8px 0',
};

const permissionGranted = {
  color: '#10b981',
  fontWeight: 'bold',
  marginRight: '8px',
  minWidth: '20px',
};

const permissionDenied = {
  color: '#ef4444',
  fontWeight: 'bold',
  marginRight: '8px',
  minWidth: '20px',
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
