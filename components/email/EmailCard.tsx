import { Section } from '@react-email/components';

interface EmailCardProps {
  children: React.ReactNode;
  padding?: string;
  backgroundColor?: string;
}

export function EmailCard({
  children,
  padding = '24px',
  backgroundColor = '#f9fafb'
}: EmailCardProps) {
  return (
    <Section style={{ ...card, padding, backgroundColor }}>
      {children}
    </Section>
  );
}

const card = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  marginBottom: '16px'
};

export default EmailCard;
