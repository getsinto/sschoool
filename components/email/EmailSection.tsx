import { Section } from '@react-email/components';

interface EmailSectionProps {
  children: React.ReactNode;
  padding?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export function EmailSection({
  children,
  padding = '0',
  backgroundColor = 'transparent',
  textAlign = 'left'
}: EmailSectionProps) {
  return (
    <Section style={{ padding, backgroundColor, textAlign }}>
      {children}
    </Section>
  );
}

export default EmailSection;
