import {
  Heading,
  Text,
  Section,
} from '@react-email/components'
import { EmailLayout } from '@/components/email/EmailLayout'
import { EmailButton } from '@/components/email/EmailButton'

interface ParentLinkRequestProps {
  parentName?: string
  studentName: string
  studentEmail: string
  studentGrade?: string
  acceptUrl: string
  declineUrl: string
}

export default function ParentLinkRequest({
  parentName = 'Parent',
  studentName = 'Student',
  studentEmail = 'student@example.com',
  studentGrade = 'Grade 5',
  acceptUrl = 'https://example.com/accept',
  declineUrl = 'https://example.com/decline'
}: ParentLinkRequestProps) {
  return (
    <EmailLayout
      previewText={`${studentName} wants to link you as their parent/guardian`}
    >
      <Heading style={heading}>Parent Account Link Request 👨‍👩‍👧</Heading>
      
      <Text style={text}>Dear {parentName},</Text>
      
      <Text style={text}>
        A student has requested to link you as their parent/guardian on St Haroon School's online education platform.
      </Text>

      <Section style={studentBox}>
        <Text style={studentTitle}>Student Information:</Text>
        <div style={studentInfo}>
          <Text style={infoRow}><strong>Name:</strong> {studentName}</Text>
          <Text style={infoRow}><strong>Email:</strong> {studentEmail}</Text>
          <Text style={infoRow}><strong>Grade:</strong> {studentGrade}</Text>
        </div>
      </Section>

      <Text style={text}>
        By accepting this link request, you will be able to:
      </Text>

      <Section style={benefitsBox}>
        <Text style={benefitItem}>✅ Monitor your child's academic progress and grades</Text>
        <Text style={benefitItem}>✅ View attendance records and class schedules</Text>
        <Text style={benefitItem}>✅ Receive notifications about assignments and exams</Text>
        <Text style={benefitItem}>✅ Communicate with teachers and administrators</Text>
        <Text style={benefitItem}>✅ Access detailed performance reports</Text>
        <Text style={benefitItem}>✅ Manage payments and subscriptions</Text>
      </Section>

      <Text style={text}>
        <strong>Please choose one of the following options:</strong>
      </Text>

      <Section style={buttonContainer}>
        <EmailButton href={acceptUrl}>
          ✓ Accept Link Request
        </EmailButton>
      </Section>

      <Section style={declineContainer}>
        <Text style={declineText}>
          If this request was made in error or you don't recognize this student, you can{' '}
          <a href={declineUrl} style={declineLink}>decline this request</a>.
        </Text>
      </Section>

      <Section style={warningBox}>
        <Text style={warningTitle}>🔒 Privacy & Security</Text>
        <Text style={warningText}>
          • You will only have access to this specific student's information<br />
          • Your access can be revoked at any time by the student or administrators<br />
          • All data is encrypted and securely stored<br />
          • We comply with all data protection regulations
        </Text>
      </Section>

      <Section style={infoBox}>
        <Text style={infoTitle}>❓ What if I don't have an account?</Text>
        <Text style={infoText}>
          If you don't have a parent account yet, clicking "Accept" will guide you through a quick registration process to create your parent account and link it to the student.
        </Text>
      </Section>

      <Text style={text}>
        This link request will expire in 7 days. If you have any questions or concerns, please contact our support team.
      </Text>

      <Text style={footerText}>
        Support: support@stharoon.com<br />
        Phone: +1 (234) 567-890
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

const studentBox = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #3b82f6',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const studentTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginBottom: '12px',
}

const studentInfo = {
  paddingLeft: '8px',
}

const infoRow = {
  fontSize: '15px',
  color: '#1e3a8a',
  marginBottom: '8px',
  lineHeight: '20px',
}

const benefitsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const benefitItem = {
  fontSize: '15px',
  color: '#374151',
  marginBottom: '10px',
  lineHeight: '22px',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const declineContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const declineText = {
  fontSize: '14px',
  color: '#6b7280',
}

const declineLink = {
  color: '#dc2626',
  textDecoration: 'underline',
}

const warningBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const warningTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#991b1b',
  marginBottom: '8px',
}

const warningText = {
  fontSize: '14px',
  color: '#7f1d1d',
  lineHeight: '20px',
  margin: '0',
}

const infoBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const infoTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  marginBottom: '8px',
}

const infoText = {
  fontSize: '14px',
  color: '#78350f',
  lineHeight: '20px',
  margin: '0',
}

const footerText = {
  fontSize: '14px',
  color: '#666',
  marginTop: '32px',
  lineHeight: '20px',
}
