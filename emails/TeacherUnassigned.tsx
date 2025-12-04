/**
 * Email Template: Teacher Unassigned from Course
 * Feature: course-assignment-permissions
 * 
 * Sent when a teacher is removed from a course by an admin
 * Requirements: 11.1, 11.3
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

interface TeacherUnassignedEmailProps {
  teacherName: string;
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

export const TeacherUnassignedEmail = ({
  teacherName = 'John Doe',
  courseName = 'Introduction to Mathematics',
  courseDescription = 'A comprehensive course covering fundamental mathematical concepts.',
  removedBy = 'Admin User',
  removalDate = 'January 2, 2025',
  removalReason,
  wasActive = true,
  studentCount = 25,
  dashboardUrl = 'https://app.example.com/teacher/dashboard',
  supportUrl = 'https://app.example.com/support',
  feedbackUrl = 'https://app.example.com/feedback',
}: TeacherUnassignedEmailProps) => {
  const previewText = `You've been removed from ${courseName}`;

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
            <Heading style={h1}>Course Assignment Update</Heading>
            
            <Text style={text}>
              Hello {teacherName},
            </Text>
            
            <Text style={text}>
              We're writing to inform you that your assignment to the following course has been updated:
            </Text>
            
            <Section style={courseInfo}>
              <Heading style={h2}>{courseName}</Heading>
              {courseDescription && (
                <Text style={description}>{courseDescription}</Text>
              )}
              
              <Text style={metadata}>
                <strong>Removed by:</strong> {removedBy}<br />
                <strong>Removal Date:</strong> {removalDate}<br />
                {wasActive && studentCount && (
                  <><strong>Students Affected:</strong> {studentCount}<br /></>
                )}
              </Text>
            </Section>
            
            {removalReason && (
              <Section style={reasonSection}>
                <Heading style={h3}>Reason for Change</Heading>
                <Text style={reasonText}>{removalReason}</Text>
              </Section>
            )}
            
            <Section style={impactSection}>
              <Heading style={h3}>What This Means</Heading>
              <ul style={impactList}>
                <li style={impactItem}>
                  You no longer have access to this course's content and materials
                </li>
                <li style={impactItem}>
                  You cannot grade assignments or communicate with students in this course
                </li>
                <li style={impactItem}>
                  The course will no longer appear in your teacher dashboard
                </li>
                {wasActive && (
                  <li style={impactItem}>
                    Students and parents have been notified of the teaching change
                  </li>
                )}
              </ul>
            </Section>
            
            <Section style={actionSection}>
              <Button style={button} href={dashboardUrl}>
                View Your Courses
              </Button>
            </Section>
            
            <Section style={supportSection}>
              <Text style={text}>
                If you have any questions about this change, please{' '}
                <Link href={supportUrl} style={link}>
                  contact our support team
                </Link>
                .
              </Text>
            </Section>
            
            <Text style={signature}>
              Thank you for your dedication to teaching,<br />
              The EduPlatform Team
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent to you because your course assignment was updated on EduPlatform.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TeacherUnassignedEmail;

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
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
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

const impactSection = {
  margin: '32px 0',
};

const impactList = {
  margin: '16px 0',
  paddingLeft: '20px',
};

const impactItem = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
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
