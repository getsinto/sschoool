import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout } from '@/components/email/EmailLayout'
import { EmailButton } from '@/components/email/EmailButton'

interface RegistrationVerificationProps {
  firstName: string
  verificationUrl: string
  expiresIn?: string
}

export default function RegistrationVerification({
  firstName = 'Student',
  verificationUrl = 'https://example.com/verify',
  expiresIn = '24 hours'
}: RegistrationVerificationProps) {
  return (
    <EmailLayout
      previewText={`Verify your email to activate your St Haroon School account`}
    >
      <Heading style={heading}>Welcome to St Haroon School! 🎓</Heading>
      
      <Text style={text}>Hi {firstName},</Text>
      
      <Text style={text}>
        Thank you for registering with St Haroon School! We're excited to have you join our online education community.
      </Text>

      <Text style={text}>
        To complete your registration and activate your account, please verify your email address by clicking the button below:
      </Text>

      <Section style={buttonContainer}>
        <EmailButton href={verificationUrl}>
          Verify Email Address
        </EmailButton>
      </Section>

      <Text style={text}>
        Or copy and paste this link into your browser:
      </Text>
      
      <Text style={linkText}>
        {verificationUrl}
      </Text>

      <Text style={warningText}>
        ⏰ This verification link will expire in {expiresIn}. If it expires, you can request a new verification email from the login page.
      </Text>

      <Section style={infoBox}>
        <Text style={infoTitle}>What happens next?</Text>
        <Text style={infoText}>
          • Once verified, you'll receive a confirmation email<br />
          • Your account will be reviewed (typically within 2-4 hours)<br />
          • You'll be notified when your account is activated<br />
          • Then you can log in and start learning!
        </Text>
      </Section>

      <Text style={text}>
        If you didn't create an account with St Haroon School, please ignore this email or contact our support team.
      </Text>

      <Text style={footerText}>
        Need help? Contact us at support@stharoon.com
      </Text>
    </EmailLayout>
  )
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: '#1a1a1a',
}

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#404040',
  marginBottom: '16px',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const linkText = {
  fontSize: '14px',
  color: '#0066cc',
  wordBreak: 'break-all' as const,
  marginBottom: '16px',
}

const warningText = {
  fontSize: '14px',
  color: '#d97706',
  backgroundColor: '#fef3c7',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '24px',
}

const infoBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const infoTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0369a1',
  marginBottom: '8px',
}

const infoText = {
  fontSize: '14px',
  color: '#075985',
  lineHeight: '20px',
  margin: '0',
}

const footerText = {
  fontSize: '14px',
  color: '#666',
  marginTop: '32px',
}
