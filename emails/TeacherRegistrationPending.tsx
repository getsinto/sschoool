import {
  Heading,
  Text,
  Section,
} from '@react-email/components'
import { EmailLayout } from '@/components/email/EmailLayout'

interface TeacherRegistrationPendingProps {
  firstName: string
  lastName: string
  submittedAt?: string
}

export default function TeacherRegistrationPending({
  firstName = 'Teacher',
  lastName = '',
  submittedAt = new Date().toLocaleDateString()
}: TeacherRegistrationPendingProps) {
  return (
    <EmailLayout
      previewText={`Your teacher application is under review`}
    >
      <Heading style={heading}>Application Received! 📋</Heading>
      
      <Text style={text}>Dear {firstName} {lastName},</Text>
      
      <Text style={text}>
        Thank you for applying to become a teacher at St Haroon School! We have successfully received your application submitted on {submittedAt}.
      </Text>

      <Section style={statusBox}>
        <Text style={statusTitle}>🔍 Application Status: Under Review</Text>
        <Text style={statusText}>
          Our team is currently reviewing your qualifications, teaching experience, and submitted documents.
        </Text>
      </Section>

      <Section style={timelineBox}>
        <Text style={timelineTitle}>What happens next?</Text>
        <div style={timelineItem}>
          <Text style={timelineStep}>Step 1: Document Verification</Text>
          <Text style={timelineDesc}>We'll verify your ID, qualifications, and resume</Text>
        </div>
        <div style={timelineItem}>
          <Text style={timelineStep}>Step 2: Background Check</Text>
          <Text style={timelineDesc}>Standard verification of teaching credentials</Text>
        </div>
        <div style={timelineItem}>
          <Text style={timelineStep}>Step 3: Review Decision</Text>
          <Text style={timelineDesc}>You'll receive our decision via email</Text>
        </div>
        <div style={timelineItem}>
          <Text style={timelineStep}>Step 4: Onboarding (if approved)</Text>
          <Text style={timelineDesc}>Complete teacher onboarding and start creating courses</Text>
        </div>
      </Section>

      <Section style={infoBox}>
        <Text style={infoTitle}>⏰ Expected Timeline</Text>
        <Text style={infoText}>
          <strong>24-48 hours</strong> - You'll receive an email notification with our decision within this timeframe.
        </Text>
      </Section>

      <Text style={text}>
        <strong>While you wait:</strong>
      </Text>
      <Text style={listText}>
        • Prepare your course materials and teaching content<br />
        • Familiarize yourself with our platform features<br />
        • Think about your teaching approach and methodology<br />
        • Review our teacher guidelines and best practices
      </Text>

      <Section style={warningBox}>
        <Text style={warningText}>
          📧 <strong>Important:</strong> Please check your email regularly (including spam folder) for updates on your application status.
        </Text>
      </Section>

      <Text style={text}>
        If you have any questions about your application, please don't hesitate to contact our teacher support team.
      </Text>

      <Text style={footerText}>
        Teacher Support: teachers@stharoon.com<br />
        General Support: support@stharoon.com
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

const statusBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const statusTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  marginBottom: '8px',
}

const statusText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0',
}

const timelineBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const timelineTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '16px',
}

const timelineItem = {
  marginBottom: '16px',
  paddingLeft: '16px',
  borderLeft: '3px solid #3b82f6',
}

const timelineStep = {
  fontSize: '15px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '4px',
}

const timelineDesc = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
}

const infoBox = {
  backgroundColor: '#dbeafe',
  border: '1px solid #93c5fd',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const infoTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginBottom: '8px',
}

const infoText = {
  fontSize: '14px',
  color: '#1e3a8a',
  margin: '0',
}

const listText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#404040',
  marginBottom: '16px',
  paddingLeft: '8px',
}

const warningBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const warningText = {
  fontSize: '14px',
  color: '#991b1b',
  margin: '0',
}

const footerText = {
  fontSize: '14px',
  color: '#666',
  marginTop: '32px',
  lineHeight: '20px',
}
