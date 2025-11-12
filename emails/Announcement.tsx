import * as React from 'react';
import { Text, Section, Heading } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface AnnouncementProps {
  recipientName: string;
  title: string;
  content: string;
  author: string;
  link?: string;
  date: string;
}

export default function Announcement({
  recipientName = 'User',
  title = 'Important Announcement',
  content = 'Announcement content goes here.',
  author = 'Platform Team',
  link,
  date = new Date().toLocaleDateString(),
}: AnnouncementProps) {
  return (
    <EmailLayout preview={title}>
      <Heading style={heading}>📢 Announcement</Heading>
      
      <Text style={text}>Hi {recipientName},</Text>
      
      <Section style={announcementBox}>
        <Heading as="h2" style={announcementTitle}>{title}</Heading>
        
        <Text style={announcementContent}>
          {content}
        </Text>
        
        <Text style={metaText}>
          Posted by <strong>{author}</strong> on {date}
        </Text>
      </Section>

      {link && (
        <EmailButton href={link}>
          Read More
        </EmailButton>
      )}

      <Text style={text}>
        Stay updated with the latest news and updates from our platform.
      </Text>

      <Text style={text}>
        Best regards,<br />
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

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const announcementBox = {
  backgroundColor: '#f6f9fc',
  border: '2px solid #556cd6',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const announcementTitle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#32325d',
  margin: '0 0 16px',
};

const announcementContent = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
  whiteSpace: 'pre-wrap' as const,
};

const metaText = {
  fontSize: '14px',
  color: '#8898aa',
  margin: '0',
  paddingTop: '16px',
  borderTop: '1px solid #e6ebf1',
};
