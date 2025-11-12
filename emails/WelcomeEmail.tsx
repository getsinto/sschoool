import * as React from 'react';
import { Text, Link, Section, Heading } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface WelcomeEmailProps {
  firstName: string;
  role: string;
  loginUrl: string;
  supportEmail: string;
}

export default function WelcomeEmail({
  firstName = 'Student',
  role = 'student',
  loginUrl = 'https://yourdomain.com/auth/login',
  supportEmail = 'support@yourdomain.com',
}: WelcomeEmailProps) {
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <EmailLayout preview={`Welcome to our learning platform, ${firstName}!`}>
      <Heading style={heading}>Welcome to Our Learning Platform!</Heading>
      
      <Text style={text}>Hi {firstName},</Text>
      
      <Text style={text}>
        We're thrilled to have you join our learning community as a {roleDisplay}! 
        You're now part of a platform dedicated to making education accessible, 
        engaging, and effective.
      </Text>

      <Section style={quickStartSection}>
        <Heading as="h2" style={subheading}>Quick Start Guide</Heading>
        
        <Text style={text}>
          <strong>1. Complete Your Profile</strong><br />
          Add your information and preferences to personalize your experience.
        </Text>
        
        <Text style={text}>
          <strong>2. {role === 'student' ? 'Browse Courses' : role === 'teacher' ? 'Create Your First Course' : 'Explore the Dashboard'}</strong><br />
          {role === 'student' && 'Discover courses that match your interests and goals.'}
          {role === 'teacher' && 'Start building engaging content for your students.'}
          {role === 'parent' && 'Monitor your child\'s progress and stay connected.'}
          {role === 'admin' && 'Manage users, courses, and platform settings.'}
        </Text>
        
        <Text style={text}>
          <strong>3. Get Started Learning</strong><br />
          Dive into your first lesson and begin your learning journey!
        </Text>
      </Section>

      <EmailButton href={loginUrl}>
        Go to Dashboard
      </EmailButton>

      <Section style={supportSection}>
        <Text style={text}>
          <strong>Need Help?</strong><br />
          Our support team is here for you. Reach out anytime at{' '}
          <Link href={`mailto:${supportEmail}`} style={link}>
            {supportEmail}
          </Link>
        </Text>
        
        <Text style={text}>
          You can also check out our{' '}
          <Link href={`${loginUrl.replace('/auth/login', '')}/faq`} style={link}>
            FAQ page
          </Link>{' '}
          for quick answers to common questions.
        </Text>
      </Section>

      <Text style={text}>
        Happy learning!<br />
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

const subheading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#32325d',
  margin: '24px 0 16px',
};

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const link = {
  color: '#556cd6',
  textDecoration: 'none',
};

const quickStartSection = {
  backgroundColor: '#f6f9fc',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const supportSection = {
  borderTop: '1px solid #e6ebf1',
  paddingTop: '24px',
  marginTop: '32px',
};
