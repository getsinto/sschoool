import * as React from 'react';
import { Section, Text, Link, Hr } from '@react-email/components';

export default function EmailFooter() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@yourdomain.com';
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Hr style={hr} />
      <Section style={footer}>
        <Text style={footerText}>
          Need help? Contact us at{' '}
          <Link href={`mailto:${supportEmail}`} style={link}>
            {supportEmail}
          </Link>
        </Text>
        <Text style={footerText}>
          <Link href={`${appUrl}/about`} style={link}>About Us</Link>
          {' • '}
          <Link href={`${appUrl}/contact`} style={link}>Contact</Link>
          {' • '}
          <Link href={`${appUrl}/faq`} style={link}>FAQ</Link>
        </Text>
        <Text style={footerText}>
          Follow us:{' '}
          <Link href="https://facebook.com" style={link}>Facebook</Link>
          {' • '}
          <Link href="https://twitter.com" style={link}>Twitter</Link>
          {' • '}
          <Link href="https://linkedin.com" style={link}>LinkedIn</Link>
        </Text>
        <Text style={copyright}>
          © {currentYear} Online Education Platform. All rights reserved.
        </Text>
        <Text style={unsubscribe}>
          <Link href={`${appUrl}/settings/notifications`} style={link}>
            Manage email preferences
          </Link>
        </Text>
      </Section>
    </>
  );
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 48px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
};

const link = {
  color: '#556cd6',
  textDecoration: 'none',
};

const copyright = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0 8px',
};

const unsubscribe = {
  color: '#8898aa',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '8px 0',
};
