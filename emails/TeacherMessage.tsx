import * as React from 'react';
import { Text, Section, Heading } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface TeacherMessageProps {
  studentName: string;
  teacherName: string;
  messageSubject: string;
  messagePreview: string;
  messageUrl: string;
}

export default function TeacherMessage({
  studentName = 'Student',
  teacherName = 'Teacher',
  messageSubject = 'Message Subject',
  messagePreview = 'Message preview text...',
  messageUrl = 'https://yourdomain.com/student/messages',
}: TeacherMessageProps) {
  return (
    <EmailLayout preview={`New message from ${teacherName}`}>
      <Heading style={heading}>💬 New Message from Your Teacher</Heading>
      
      <Text style={text}>Hi {studentName},</Text>
      
      <Text style={text}>
        You have received a new message from <strong>{teacherName}</strong>.
      </Text>

      <Section style={messageBox}>
        <Text style={subjectLabel}>Subject:</Text>
        <Text style={subjectText}>{messageSubject}</Text>
        
        <Text style={previewLabel}>Message Preview:</Text>
        <Text style={previewText}>
          {messagePreview}
        </Text>
      </Section>

      <EmailButton href={messageUrl}>
        Read Full Message
      </EmailButton>

      <Section style={tipBox}>
        <Text style={tipText}>
          💡 <strong>Tip:</strong> Reply promptly to stay engaged with your coursework 
          and get the support you need.
        </Text>
      </Section>

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

const messageBox = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const subjectLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#8898aa',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
  letterSpacing: '0.5px',
};

const subjectText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#32325d',
  margin: '0 0 16px',
};

const previewLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#8898aa',
  textTransform: 'uppercase' as const,
  margin: '16px 0 4px',
  letterSpacing: '0.5px',
};

const previewText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0',
  fontStyle: 'italic',
};

const tipBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const tipText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#856404',
  margin: '0',
};
