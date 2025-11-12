import * as React from 'react';
import { Text, Section, Heading, Hr } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';
import CourseCard from '@/components/email/CourseCard';

interface EnrollmentConfirmationProps {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  courseThumbnail?: string;
  startDate?: string;
  courseUrl: string;
}

export default function EnrollmentConfirmation({
  studentName = 'Student',
  courseTitle = 'Course Name',
  instructorName = 'Instructor',
  courseThumbnail,
  startDate,
  courseUrl = 'https://yourdomain.com/student/courses',
}: EnrollmentConfirmationProps) {
  return (
    <EmailLayout preview={`You're enrolled in ${courseTitle}!`}>
      <Heading style={heading}>🎉 Enrollment Confirmed!</Heading>
      
      <Text style={text}>Hi {studentName},</Text>
      
      <Text style={text}>
        Congratulations! You've successfully enrolled in <strong>{courseTitle}</strong>. 
        Get ready to embark on an exciting learning journey!
      </Text>

      <CourseCard
        title={courseTitle}
        instructor={instructorName}
        thumbnail={courseThumbnail}
      />

      {startDate && (
        <Section style={infoBox}>
          <Text style={infoText}>
            📅 Course starts: <strong>{startDate}</strong>
          </Text>
        </Section>
      )}

      <Section style={accessSection}>
        <Heading as="h2" style={subheading}>How to Access Your Course</Heading>
        
        <Text style={text}>
          1. Log in to your student dashboard<br />
          2. Navigate to "My Courses"<br />
          3. Click on "{courseTitle}" to start learning
        </Text>
      </Section>

      <EmailButton href={courseUrl}>
        Start Learning Now
      </EmailButton>

      <Hr style={divider} />

      <Section style={tipsSection}>
        <Heading as="h3" style={tipsHeading}>Tips for Success</Heading>
        
        <Text style={tipText}>
          ✓ Set aside dedicated study time each week<br />
          ✓ Complete assignments before deadlines<br />
          ✓ Participate in discussions and ask questions<br />
          ✓ Connect with your instructor and classmates
        </Text>
      </Section>

      <Text style={text}>
        We're excited to support you on this learning journey!
      </Text>

      <Text style={text}>
        Happy learning,<br />
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

const subheading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#32325d',
  margin: '24px 0 16px',
};

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const infoBox = {
  backgroundColor: '#d4edda',
  border: '1px solid #c3e6cb',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const infoText = {
  fontSize: '16px',
  color: '#155724',
  margin: '0',
};

const accessSection = {
  backgroundColor: '#f6f9fc',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const divider = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
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

const tipText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525f7f',
  margin: '0',
};
