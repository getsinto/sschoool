import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Preview
} from '@react-email/components';
import EmailHeader from './EmailHeader';
import EmailFooter from './EmailFooter';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export default function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailHeader />
          <Section style={content}>
            {children}
          </Section>
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: '#f3f4f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden'
};

const content = {
  padding: '32px'
};
