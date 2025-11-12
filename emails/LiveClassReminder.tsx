import * as React from 'react';
import { Text, Section, Heading, Link } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface LiveClassReminderProps {
  studentName: string;
  classTitle: string;
  courseName: string;
  startTime: string;
  duration: number;
  meetingUrl: string;
  meetingPassword?: string;
  calendarUrl?: string;
}

export default function LiveClassReminder({
  studentName = 'Student',
  classTitle = 'Class Title',
  courseName = 'Course Name',
  startTime = 'Tomorrow at 10:00 AM',
  duration = 60,
  meetingUrl = 'https://meet.example.com',
  meetingPassword,
  calendarUrl,
}: LiveClassReminderProps) {
  return (
    <EmailLayout preview={`Reminder: ${classTitle} starts soon`}>
      <Heading style={heading}>📚 Live Class Reminder</Heading>
      
      <Text style={text}>Hi {studentName},</Text>
      
      <Text style={text}>
        This is a friendly reminder that your live class is coming up soon!
      </Text>

      <Section style={classBox}>
        <Text style={classTitle}>{classTitle}</Text>
        <Text style={courseText}>Course: {courseName}</Text>
        
        <Section style={detailsSection}>
          <Text style={detailItem}>
            🕐 <strong>Time:</strong> {startTime}
          </Text>
          <Text style={detailItem}>
            ⏱️ <strong>Duration:</strong> {duration} minutes
          </Text>
          {meetingPassword && (
            <Text style={detailItem}>
              🔐 <strong>Password:</strong> {meetingPassword}
            </Text>
          )}
        </Section>
      </Section>

      <EmailButton href={meetingUrl}>
        Join Class Now
      </EmailButton>

      {calendarUrl && (
        <Text style={calendarText}>
          <Link href={calendarUrl} style={link}>
            Add to Calendar
          </Link>
        </Text>
      )}

      <Section style={checklistSection}>
        <Heading as="h3" style={checklistHeading}>Pre-Class Checklist</Heading>
        <Text style={checklistText}>
          ✓ Test your camera and microphone<br />
          ✓ Find a quiet space with good lighting<br />
          ✓ Have your course materials ready<br />
          ✓ Join a few minutes early
        </Text>
      </Section>

      <Section style={techSection}>
        <Text style={techText}>
          <strong>Technical Issues?</strong><br />
          If you experience any problems joining the class, contact support immediately.
        </Text>
      </Section>

      <Text style={text}>
        See you in class!<br />
        The Education Platform Team
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#32325d',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const classBox = {
  backgroundColor: '#f6f9fc',
  border: '2px solid #556cd6',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const classTitle = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#32325d',
  margin: '0 0 8px',
};

const courseText = {
  fontSize: '16px',
  color: '#8898aa',
  margin: '0 0 16px',
};

const detailsSection = {
  marginTop: '16px',
};

const detailItem = {
  fontSize: '16px',
  lineHeight: '28px',
  color: '#525f7f',
  margin: '0',
};

const calendarText = {
  textAlign: 'center' as const,
  margin: '16px 0',
  fontSize: '14px',
};

const link = {
  color: '#556cd6',
  textDecoration: 'none',
};

const checklistSection = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const checklistHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#856404',
  margin: '0 0 12px',
};

const checklistText = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#856404',
  margin: '0',
};

const techSection = {
  borderTop: '1px solid #e6ebf1',
  paddingTop: '20px',
  marginTop: '24px',
};

const techText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#8898aa',
  margin: '0',
};
