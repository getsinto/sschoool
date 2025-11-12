import * as React from 'react';
import { Text, Section, Heading, Img, Link } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface CertificateEarnedProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateUrl: string;
  certificatePreview?: string;
  linkedInShareUrl?: string;
}

export default function CertificateEarned({
  studentName = 'Student',
  courseName = 'Course Name',
  completionDate = 'Today',
  certificateUrl = 'https://yourdomain.com/certificate',
  certificatePreview,
  linkedInShareUrl,
}: CertificateEarnedProps) {
  return (
    <EmailLayout preview={`Congratulations! You've earned a certificate`}>
      <Heading style={heading}>🎉 Congratulations!</Heading>
      
      <Text style={celebrationText}>
        You've Earned a Certificate!
      </Text>

      <Text style={text}>Hi {studentName},</Text>
      
      <Text style={text}>
        We're thrilled to congratulate you on successfully completing{' '}
        <strong>{courseName}</strong>! Your dedication and hard work have paid off.
      </Text>

      {certificatePreview && (
        <Section style={previewSection}>
          <Img
            src={certificatePreview}
            alt="Certificate Preview"
            width="100%"
            style={certificateImage}
          />
        </Section>
      )}

      <Section style={detailsBox}>
        <Text style={detailLabel}>Course Completed</Text>
        <Text style={detailValue}>{courseName}</Text>
        <Text style={completionText}>
          Completion Date: {completionDate}
        </Text>
      </Section>

      <EmailButton href={certificateUrl}>
        Download Certificate
      </EmailButton>

      {linkedInShareUrl && (
        <Section style={shareSection}>
          <Text style={shareText}>
            Share your achievement with your professional network!
          </Text>
          <EmailButton href={linkedInShareUrl} variant="secondary">
            Share on LinkedIn
          </EmailButton>
        </Section>
      )}

      <Section style={nextStepsSection}>
        <Heading as="h3" style={nextStepsHeading}>What's Next?</Heading>
        <Text style={nextStepsText}>
          • Add this certificate to your resume and LinkedIn profile<br />
          • Explore advanced courses to continue your learning journey<br />
          • Share your success story with friends and colleagues<br />
          • Leave a review to help other learners
        </Text>
      </Section>

      <Section style={messageSection}>
        <Text style={messageText}>
          We're proud of your achievement and excited to see where your new skills 
          take you. Thank you for being part of our learning community!
        </Text>
      </Section>

      <Text style={text}>
        Congratulations again!<br />
        The Education Platform Team
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#32325d',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const celebrationText = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#28a745',
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const previewSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const certificateImage = {
  border: '2px solid #e6ebf1',
  borderRadius: '8px',
  maxWidth: '100%',
  height: 'auto',
};

const detailsBox = {
  backgroundColor: '#f6f9fc',
  border: '2px solid #556cd6',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const detailLabel = {
  fontSize: '12px',
  color: '#8898aa',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const detailValue = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#32325d',
  margin: '0 0 12px',
};

const completionText = {
  fontSize: '14px',
  color: '#525f7f',
  margin: '0',
};

const shareSection = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const shareText = {
  fontSize: '16px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const nextStepsSection = {
  borderLeft: '4px solid #28a745',
  paddingLeft: '20px',
  margin: '32px 0',
};

const nextStepsHeading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#32325d',
  margin: '0 0 12px',
};

const nextStepsText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0',
};

const messageSection = {
  backgroundColor: '#d4edda',
  border: '1px solid #c3e6cb',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
};

const messageText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#155724',
  margin: '0',
  textAlign: 'center' as const,
};
