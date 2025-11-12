import * as React from 'react';
import { Text, Section, Heading } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface AssignmentDueReminderProps {
  studentName: string;
  assignmentTitle: string;
  courseName: string;
  dueDate: string;
  submissionUrl: string;
  isUrgent?: boolean;
  timeRemaining?: string;
}

export default function AssignmentDueReminder({
  studentName = 'Student',
  assignmentTitle = 'Assignment Title',
  courseName = 'Course Name',
  dueDate = 'Tomorrow at 11:59 PM',
  submissionUrl = 'https://yourdomain.com/submit',
  isUrgent = false,
  timeRemaining = '24 hours',
}: AssignmentDueReminderProps) {
  return (
    <EmailLayout preview={`${isUrgent ? '⚠️ Urgent: ' : ''}${assignmentTitle} due soon`}>
      <Heading style={heading}>
        {isUrgent ? '⚠️ Urgent Assignment Reminder' : '📝 Assignment Reminder'}
      </Heading>
      
      <Text style={text}>Hi {studentName},</Text>
      
      <Text style={text}>
        {isUrgent 
          ? 'This is an urgent reminder that your assignment deadline is approaching!'
          : 'Just a friendly reminder about your upcoming assignment deadline.'}
      </Text>

      <Section style={isUrgent ? urgentBox : assignmentBox}>
        <Text style={assignmentTitle_style}>{assignmentTitle}</Text>
        <Text style={courseText}>Course: {courseName}</Text>
        
        <Section style={dueDateSection}>
          <Text style={dueDateLabel}>Due Date:</Text>
          <Text style={dueDateValue}>{dueDate}</Text>
          {timeRemaining && (
            <Text style={timeRemainingText}>
              ⏰ {timeRemaining} remaining
            </Text>
          )}
        </Section>
      </Section>

      <EmailButton href={submissionUrl}>
        Submit Assignment
      </EmailButton>

      {isUrgent && (
        <Section style={warningSection}>
          <Text style={warningText}>
            <strong>⚠️ Important:</strong> Late submissions may result in grade penalties. 
            Please submit your work before the deadline to receive full credit.
          </Text>
        </Section>
      )}

      <Section style={tipsSection}>
        <Heading as="h3" style={tipsHeading}>Submission Tips</Heading>
        <Text style={tipsText}>
          • Review the assignment requirements carefully<br />
          • Check your work for completeness<br />
          • Submit early to avoid last-minute technical issues<br />
          • Keep a copy of your submission for your records
        </Text>
      </Section>

      <Text style={text}>
        {isUrgent 
          ? 'Don\'t wait - submit your assignment now!'
          : 'Good luck with your assignment!'}
      </Text>

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

const assignmentBox = {
  backgroundColor: '#f6f9fc',
  border: '2px solid #556cd6',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const urgentBox = {
  backgroundColor: '#fff3cd',
  border: '3px solid #dc3545',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const assignmentTitle_style = {
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

const dueDateSection = {
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '6px',
  marginTop: '16px',
  textAlign: 'center' as const,
};

const dueDateLabel = {
  fontSize: '14px',
  color: '#8898aa',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const dueDateValue = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#32325d',
  margin: '0 0 8px',
};

const timeRemainingText = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#dc3545',
  margin: '0',
};

const warningSection = {
  backgroundColor: '#f8d7da',
  border: '2px solid #dc3545',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#721c24',
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
