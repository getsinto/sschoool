import * as React from 'react';
import { Text, Section, Heading } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface GradePostedProps {
  studentName: string;
  assessmentName: string;
  courseName: string;
  grade: number;
  percentage: number;
  passed: boolean;
  feedback?: string;
  viewUrl: string;
}

export default function GradePosted({
  studentName = 'Student',
  assessmentName = 'Assessment',
  courseName = 'Course Name',
  grade = 0,
  percentage = 0,
  passed = true,
  feedback,
  viewUrl = 'https://yourdomain.com/grades',
}: GradePostedProps) {
  return (
    <EmailLayout preview={`Your grade for ${assessmentName} is now available`}>
      <Heading style={heading}>
        {passed ? '✅ Grade Posted' : '📊 Grade Posted'}
      </Heading>
      
      <Text style={text}>Hi {studentName},</Text>
      
      <Text style={text}>
        Your grade for <strong>{assessmentName}</strong> in {courseName} has been posted.
      </Text>

      <Section style={passed ? passedBox : needsImprovementBox}>
        <Text style={assessmentTitle}>{assessmentName}</Text>
        <Text style={courseText}>{courseName}</Text>
        
        <Section style={gradeSection}>
          <Text style={gradeLabel}>Your Grade</Text>
          <Text style={gradeValue}>{grade}</Text>
          <Text style={percentageText}>{percentage}%</Text>
          <Text style={statusText}>
            {passed ? '✓ Passed' : '⚠ Needs Improvement'}
          </Text>
        </Section>
      </Section>

      {feedback && (
        <Section style={feedbackSection}>
          <Heading as="h3" style={feedbackHeading}>Teacher Feedback</Heading>
          <Text style={feedbackText}>{feedback}</Text>
        </Section>
      )}

      <EmailButton href={viewUrl}>
        View Full Details
      </EmailButton>

      {passed ? (
        <Section style={congratsSection}>
          <Text style={congratsText}>
            🎉 <strong>Congratulations!</strong> Keep up the great work!
          </Text>
        </Section>
      ) : (
        <Section style={encouragementSection}>
          <Text style={encouragementText}>
            <strong>Don't be discouraged!</strong> Review the feedback and reach out 
            to your instructor if you need help understanding the material.
          </Text>
        </Section>
      )}

      <Text style={text}>
        Best regards,<br />
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

const passedBox = {
  backgroundColor: '#d4edda',
  border: '3px solid #28a745',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const needsImprovementBox = {
  backgroundColor: '#fff3cd',
  border: '3px solid #ffc107',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const assessmentTitle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#32325d',
  margin: '0 0 4px',
};

const courseText = {
  fontSize: '14px',
  color: '#8898aa',
  margin: '0 0 20px',
};

const gradeSection = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0 0',
};

const gradeLabel = {
  fontSize: '12px',
  color: '#8898aa',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const gradeValue = {
  fontSize: '48px',
  fontWeight: '700',
  color: '#32325d',
  margin: '0',
  lineHeight: '1',
};

const percentageText = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#525f7f',
  margin: '8px 0',
};

const statusText = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '12px 0 0',
};

const feedbackSection = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  borderLeft: '4px solid #556cd6',
};

const feedbackHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#32325d',
  margin: '0 0 12px',
};

const feedbackText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0',
  fontStyle: 'italic' as const,
};

const congratsSection = {
  backgroundColor: '#d4edda',
  border: '1px solid #c3e6cb',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const congratsText = {
  fontSize: '16px',
  color: '#155724',
  margin: '0',
};

const encouragementSection = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const encouragementText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#856404',
  margin: '0',
};
