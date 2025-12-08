import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface UserCredentialsEmailProps {
  userName: string
  userEmail: string
  temporaryPassword: string
  userRole: string
  loginUrl: string
}

export default function UserCredentialsEmail({
  userName,
  userEmail,
  temporaryPassword,
  userRole,
  loginUrl,
}: UserCredentialsEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your account has been created - Login credentials inside</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to St. Haroon Online School!</Heading>
          
          <Text style={text}>
            Hello {userName},
          </Text>
          
          <Text style={text}>
            An administrator has created an account for you. Below are your login credentials:
          </Text>

          <Section style={credentialsBox}>
            <Text style={credentialLabel}>Email:</Text>
            <Text style={credentialValue}>{userEmail}</Text>
            
            <Text style={credentialLabel}>Temporary Password:</Text>
            <Text style={credentialValue}>{temporaryPassword}</Text>
            
            <Text style={credentialLabel}>Role:</Text>
            <Text style={credentialValue}>{userRole}</Text>
          </Section>

          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ <strong>Important Security Notice:</strong>
            </Text>
            <Text style={warningText}>
              • This is a temporary password. You will be required to change it on first login.
            </Text>
            <Text style={warningText}>
              • Do not share this password with anyone.
            </Text>
            <Text style={warningText}>
              • This email contains sensitive information. Please delete it after changing your password.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Login to Your Account
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            If you did not expect this email or believe it was sent in error, please contact our support team immediately.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} St. Haroon Online School. All rights reserved.
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
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const credentialsBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e1e4e8',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
}

const credentialLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '600',
  margin: '8px 0 4px 0',
  textTransform: 'uppercase' as const,
}

const credentialValue = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  fontFamily: 'monospace',
}

const warningBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
}

const warningText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '4px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const hr = {
  borderColor: '#e1e4e8',
  margin: '32px 40px',
}

const footer = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '8px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}
