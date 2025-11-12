import {
  Heading,
  Text,
  Section,
} from '@react-email/components'
import { EmailLayout } from '@/components/email/EmailLayout'
import { EmailButton } from '@/components/email/EmailButton'

interface RegistrationRejectedProps {
  firstName: string
  reason: string
  supportEmail?: string
}

export default function RegistrationRejected({
  firstName = 'User',
  reason = 'Application did not meet our requirements',
  supportEmail = 'support@stharoon.com'
}: RegistrationRejectedProps) {
  return (
    <EmailLayout
      previewText={`Registration Update - St Haroon School`}
      heading="Registration Update"
    >
      <Section>
        <Text style={paragraph}>
          Dear {firstName},
        </Text>
        
        <Text style={paragraph}>
          Thank you for your interest in joining St Haroon School's online education platform.
        </Text>
        
        <Text style={paragraph}>
          After careful review of your application, we regret to inform you that we are unable to approve your registration at this time.
        </Text>
        
        <Section style={reasonBox}>
          <Heading as="h3" style={reasonHeading}>
            Reason for Decision:
          </Heading>
          <Text style={reasonText}>
            {reason}
          </Text>
        </Section>
        
        <Text style={paragraph}>
          We understand this may be disappointing. If you believe this decision was made in error or if you have additional information that may help us reconsider, please don't hesitate to contact our support team.
        </Text>
        
        <Section style={buttonContainer}>
          <EmailButton href={`mailto:${supportEmail}`}>
            Contact Support
          </EmailButton>
        </Section>
        
        <Text style={paragraph}>
          You may also reapply in the future if your circumstances change or if you can address the concerns mentioned above.
        </Text>
        
        <Text style={paragraph}>
          Thank you for your understanding.
        </Text>
        
        <Text style={signature}>
          Best regards,<br />
          The St Haroon School Team
        </Text>
      </Section>
    </EmailLayout>
  )
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  marginBottom: '16px'
}

const reasonBox = {
  backgroundColor: '#FEF2F2',
  border: '1px solid #FCA5A5',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
  marginBottom: '24px'
}

const reasonHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#991B1B',
  marginTop: '0',
  marginBottom: '12px'
}

const reasonText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#7F1D1D',
  marginBottom: '0'
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px'
}

const signature = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  marginTop: '32px'
}
