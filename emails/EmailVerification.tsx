import * as React from 'react';
import { Text, Section, Heading } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface EmailVerificationProps {
  firstName: string;
  verificationUrl: string;
  expiresIn?: string;
}

export default function EmailVerification({
  firstName = 'User',
  verificationUrl = 'https://yourdomain.com/auth/verify-email',
  expiresIn = '24 hours',
}: EmailVerificationProps) {
  return (
    <EmailLayout preview="Verify your email address">
      <Heading style={heading}>Verify Your Email Address</Heading>
      
      <Text style={text}>Hi {firstName},</Text>
      
      <Text style={text}>
        Thanks for signing up! To complete your registration and access all features, 
        please verify your email address by clicking the button below.
      </Text>

      <EmailButton href={verificationUrl}>
        Verify Email Address
      </EmailButton>

      <Section style={infoBox}>
        <Text style={infoText}>
          ⏰ This link will expire in {expiresIn}
        </Text>
      </Section>

      <Text style={text}>
        If the button doesn't work, copy and paste this link into your browser:
      </Text>
      
      <Text style={urlText}>
        {verificationUrl}
      </Text>

      <Section style={securitySection}>
        <Text style={securityText}>
          <strong>Security Note:</strong> If you didn't create an account with us, 
          please ignore this email or contact our support team if you have concerns.
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

const infoBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const infoText = {
  fontSize: '14px',
  color: '#856404',
  margin: '0',
};

const urlText = {
  fontSize: '14px',
  color: '#8898aa',
  wordBreak: 'break-all' as const,
  padding: '12px',
  backgroundColor: '#f6f9fc',
  borderRadius: '4px',
  margin: '0 0 24px',
};

const securitySection = {
  borderTop: '1px solid #e6ebf1',
  paddingTop: '24px',
  marginTop: '32px',
};

const securityText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#8898aa',
  margin: '0',
};
