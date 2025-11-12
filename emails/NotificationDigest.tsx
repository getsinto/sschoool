import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr
} from '@react-email/components';
import EmailHeader from '@/components/email/EmailHeader';
import EmailFooter from '@/components/email/EmailFooter';
import EmailButton from '@/components/email/EmailButton';

interface NotificationDigestProps {
  userName: string;
  notifications: Array<{
    title: string;
    message: string;
    type: string;
    created_at: string;
    action_url?: string;
  }>;
  unreadCount: number;
  platformUrl: string;
}

export default function NotificationDigest({
  userName = 'Student',
  notifications = [],
  unreadCount = 0,
  platformUrl = 'https://example.com'
}: NotificationDigestProps) {
  return (
    <Html>
      <Head />
      <Preview>You have {unreadCount} unread notifications</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <Section style={content}>
            <Heading style={h1}>Your Notification Digest</Heading>
            
            <Text style={text}>Hi {userName},</Text>
            
            <Text style={text}>
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''} waiting for you.
            </Text>

            {notifications.map((notification, index) => (
              <Section key={index} style={notificationCard}>
                <Text style={notificationType}>{notification.type.toUpperCase()}</Text>
                <Heading as="h3" style={notificationTitle}>
                  {notification.title}
                </Heading>
                <Text style={notificationMessage}>
                  {notification.message}
                </Text>
                {notification.action_url && (
                  <Link href={notification.action_url} style={link}>
                    View Details →
                  </Link>
                )}
                <Text style={notificationDate}>
                  {new Date(notification.created_at).toLocaleString()}
                </Text>
              </Section>
            ))}

            <Section style={buttonContainer}>
              <EmailButton href={`${platformUrl}/notifications`}>
                View All Notifications
              </EmailButton>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              You're receiving this email because you have unread notifications.
              You can manage your notification preferences in your account settings.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const notificationCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const notificationType = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px 0',
};

const notificationTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const notificationMessage = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px 0',
};

const notificationDate = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '8px 0 0 0',
};

const link = {
  color: '#3b82f6',
  fontSize: '14px',
  textDecoration: 'none',
  fontWeight: '500',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '16px 0',
};
