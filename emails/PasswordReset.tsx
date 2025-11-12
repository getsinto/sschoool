import * as React from 'react';
import { Text, Section, Heading } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface PasswordResetProps {
  firstName: string;
  resetUrl: string;
  expiresIn?: string;
}

export default function PasswordReset({
  firstName = 'User',
  resetUrl = 'https://yourdomain.com/auth/reset-password',
  expiresIn = '1 hour',
}: PasswordResetProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading style={heading}>Reset Your Password</Heading>
      
      <Text style={text}>Hi {firstName},</Text>
      
      <Text style={text}>
        We received a request to reset your password. Click the button below to 
        create a new password for your account.
      </Text>

      <EmailButton href={resetUrl}>
        Reset Password
      </EmailButton>

      <Section style={warningBox}>
        <Text style={warningText}>
          ⚠️ This link will expire in {expiresIn}
        </Text>
      </Section>

      <Text style={text}>
        If the button doesn't work, copy and paste this link into your browser:
      </Text>
      
      <Text style={urlText}>
        {resetUrl}
      </Text>

      <Section style={securitySection}>
        <Text style={securityText}>
          <strong>Didn't request this?</strong><br />
          If you didn't request a password reset, please ignore this email. 
          Your password will remain unchanged. For security concerns, contact 
          our support team immediately.
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

const warningBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const warningText = {
  fontSize: '14px',
  color: '#856404',
  margin: '0',
  fontWeight: '600',
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
  backgroundColor: '#f8d7da',
  border: '1px solid #f5c6cb',
  borderRadius: '6px',
  padding: '16px',
  marginTop: '32px',
};

const securityText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#721c24',
  margin: '0',
};
