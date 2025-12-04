import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface CourseDeletedEmailProps {
  teacherName: string
  courseTitle: string
  deletedBy: string
  deletedAt: string
  reason?: string
}

export default function CourseDeletedEmail({
  teacherName = 'Teacher',
  courseTitle = 'Course Name',
  deletedBy = 'Administrator',
  deletedAt = new Date().toLocaleDateString(),
  reason,
}: CourseDeletedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Course "{courseTitle}" has been deleted</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Course Deleted</Heading>
          
          <Text style={text}>Hi {teacherName},</Text>
          
          <Text style={text}>
            We're writing to inform you that the course you were assigned to has been deleted.
          </Text>

          <Section style={courseInfoSection}>
            <Text style={courseInfoLabel}>Course:</Text>
            <Text style={courseInfoValue}>{courseTitle}</Text>
            
            <Text style={courseInfoLabel}>Deleted by:</Text>
            <Text style={courseInfoValue}>{deletedBy}</Text>
            
            <Text style={courseInfoLabel}>Deleted on:</Text>
            <Text style={courseInfoValue}>{deletedAt}</Text>
            
            {reason && (
              <>
                <Text style={courseInfoLabel}>Reason:</Text>
                <Text style={courseInfoValue}>{reason}</Text>
              </>
            )}
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            <strong>What this means:</strong>
          </Text>
          
          <ul style={list}>
            <li style={listItem}>You no longer have access to this course</li>
            <li style={listItem}>All course content and materials have been removed</li>
            <li style={listItem}>Student enrollments have been cancelled</li>
            <li style={listItem}>Your assignment to this course has been removed</li>
          </ul>

          <Hr style={hr} />

          <Text style={text}>
            If you have any questions about this deletion, please contact the administrator who deleted the course or reach out to support.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/teacher/courses`}>
              View My Courses
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This is an automated notification from St. Haroon Online School.
            <br />
            If you believe this was done in error, please contact support immediately.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#dc2626',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
}

const courseInfoSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
}

const courseInfoLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '4px',
  marginTop: '12px',
}

const courseInfoValue = {
  color: '#333',
  fontSize: '16px',
  marginTop: '0',
  marginBottom: '0',
}

const list = {
  paddingLeft: '20px',
  margin: '16px 40px',
}

const listItem = {
  marginBottom: '12px',
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
}

const buttonContainer = {
  padding: '27px 40px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  textAlign: 'center' as const,
}
