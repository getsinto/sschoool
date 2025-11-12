import {
  Heading,
  Text,
  Section,
} from '@react-email/components'
import { EmailLayout } from '@/components/email/EmailLayout'
import { EmailButton } from '@/components/email/EmailButton'

interface RegistrationApprovedProps {
  firstName: string
  userType: 'student' | 'teacher' | 'parent' | 'spoken_english'
  loginUrl?: string
}

export default function RegistrationApproved({
  firstName = 'User',
  userType = 'student',
  loginUrl = 'https://stharoon.com/auth/login'
}: RegistrationApprovedProps) {
  const getUserTypeTitle = () => {
    switch (userType) {
      case 'student': return 'Student'
      case 'teacher': return 'Teacher'
      case 'parent': return 'Parent/Guardian'
      case 'spoken_english': return 'Spoken English Student'
    }
  }

  const getWelcomeMessage = () => {
    switch (userType) {
      case 'student': 
        return 'Your student account has been approved! You can now access all courses, join live classes, and start your learning journey.'
      case 'teacher': 
        return 'Your teacher application has been approved! You can now create courses, schedule live classes, and start teaching on our platform.'
      case 'parent': 
        return 'Your parent account has been approved! You can now monitor your child\'s progress, view reports, and stay connected with their education.'
      case 'spoken_english': 
        return 'Your account has been approved! You can now start your English learning journey with our expert instructors.'
    }
  }

  const getNextSteps = () => {
    switch (userType) {
      case 'student':
        return [
          'Browse our course catalog and enroll in courses',
          'Complete your profile and set learning goals',
          'Join live classes and interact with teachers',
          'Track your progress and earn certificates'
        ]
      case 'teacher':
        return [
          'Complete your teacher profile and add a bio',
          'Create your first course and upload materials',
          'Schedule live classes for your students',
          'Start earning by teaching what you love'
        ]
      case 'parent':
        return [
          'Link your child\'s account to monitor progress',
          'View academic reports and attendance',
          'Communicate with teachers and administrators',
          'Manage payments and subscriptions'
        ]
      case 'spoken_english':
        return [
          'Take a placement test to assess your level',
          'Browse available English courses and instructors',
          'Schedule your first speaking session',
          'Set your learning goals and track progress'
        ]
    }
  }

  return (
    <EmailLayout
      previewText={`Your ${getUserTypeTitle()} account has been approved!`}
    >
      <Heading style={heading}>🎉 Welcome to St Haroon School!</Heading>
      
      <Text style={text}>Hi {firstName},</Text>
      
      <Section style={successBox}>
        <Text style={successTitle}>✅ Account Approved!</Text>
        <Text style={successText}>
          {getWelcomeMessage()}
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <EmailButton href={loginUrl}>
          Log In to Your Account
        </EmailButton>
      </Section>

      <Section style={stepsBox}>
        <Text style={stepsTitle}>🚀 Get Started:</Text>
        {getNextSteps().map((step, index) => (
          <Text key={index} style={stepItem}>
            {index + 1}. {step}
          </Text>
        ))}
      </Section>

      {userType === 'teacher' && (
        <Section style={teacherBox}>
          <Text style={teacherTitle}>👨‍🏫 Teacher Resources</Text>
          <Text style={teacherText}>
            • Access our Teacher Handbook for best practices<br />
            • Join the Teacher Community for support and tips<br />
            • Watch tutorial videos on course creation<br />
            • Contact teacher support for any questions
          </Text>
        </Section>
      )}

      <Section style={infoBox}>
        <Text style={infoTitle}>📚 Platform Features</Text>
        <Text style={infoText}>
          • Live interactive classes with video conferencing<br />
          • Comprehensive course materials and resources<br />
          • Progress tracking and performance analytics<br />
          • Certificates upon course completion<br />
          • 24/7 support from our team
        </Text>
      </Section>

      <Text style={text}>
        We're thrilled to have you as part of the St Haroon School community. If you have any questions or need assistance getting started, our support team is here to help!
      </Text>

      <Text style={footerText}>
        Support: support@stharoon.com<br />
        {userType === 'teacher' && 'Teacher Support: teachers@stharoon.com'}
      </Text>
    </EmailLayout>
  )
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: '#1a1a1a',
  textAlign: 'center' as const,
}

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#404040',
  marginBottom: '16px',
}

const successBox = {
  backgroundColor: '#d1fae5',
  border: '2px solid #10b981',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const successTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#065f46',
  marginBottom: '12px',
}

const successText = {
  fontSize: '16px',
  color: '#047857',
  margin: '0',
  lineHeight: '24px',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const stepsBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const stepsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0369a1',
  marginBottom: '12px',
}

const stepItem = {
  fontSize: '15px',
  color: '#075985',
  marginBottom: '8px',
  lineHeight: '22px',
}

const teacherBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const teacherTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  marginBottom: '12px',
}

const teacherText = {
  fontSize: '14px',
  color: '#78350f',
  lineHeight: '22px',
  margin: '0',
}

const infoBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const infoTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '12px',
}

const infoText = {
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '22px',
  margin: '0',
}

const footerText = {
  fontSize: '14px',
  color: '#666',
  marginTop: '32px',
  lineHeight: '20px',
}
