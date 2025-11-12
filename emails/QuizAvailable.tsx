import * as React from 'react';
import { Text, Section, Heading } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface QuizAvailableProps {
  studentName: string;
  quizTitle: string;
  courseName: string;
  availableUntil?: string;
  quizUrl: string;
}

export default function QuizAvailable({
  studentName = 'Student',
  quizTitle = 'Quiz Title',
  courseName = 'Course Name',
  availableUntil,
  quizUrl = 'https://yourdomain.com/quiz',
}: QuizAvailableProps) {
  return (
    <EmailLayout preview={`New quiz available: ${quizTitle}`}>
      <Heading style={heading}>📋 New Quiz Available!</Heading>
      
      <Text style={text}>Hi {studentName},</Text>
      
      <Text style={text}>
        A new quiz is now available for you to take in <strong>{courseName}</strong>.
      </Text>

      <Section style={quizBox}>
        <Text style={quizTitle_style}>{quizTitle}</Text>
        <Text style={courseText}>{courseName}</Text>
        
        {availableUntil && (
          <Section style={deadlineBox}>
            <Text style={deadlineText}>
              ⏰ Available until: <strong>{availableUntil}</strong>
            </Text>
          </Section>
        )}
      </Section>

      <EmailButton href={quizUrl}>
        Take Quiz Now
      </EmailButton>

      <Section style={tipsSection}>
        <Heading as="h3" style={tipsHeading}>Quiz Tips</Heading>
        <Text style={tipsText}>
          • Review your course materials before starting<br />
          • Find a quiet place without distractions<br />
          • Read each question carefully<br />
          • Manage your time wisely
        </Text>
      </Section>

      <Text style={text}>
        Good luck!<br />
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

const quizBox = {
  backgroundColor: '#f6f9fc',
  border: '2px solid #556cd6',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const quizTitle_style = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#32325d',
  margin: '0 0 8px',
};

const courseText = {
  fontSize: '16px',
  color: '#8898aa',
  margin: '0',
};

const deadlineBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '6px',
  padding: '12px',
  marginTop: '16px',
};

const deadlineText = {
  fontSize: '14px',
  color: '#856404',
  margin: '0',
};

const tipsSection = {
  borderLeft: '4px solid #556cd6',
  paddingLeft: '20px',
  margin: '24px 0',
};

const tipsHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#32325d',
  margin: '0 0 12px',
};

const tipsText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525f7f',
  margin: '0',
};
