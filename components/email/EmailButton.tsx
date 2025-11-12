import { Button } from '@react-email/components';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export default function EmailButton({
  href,
  children,
  variant = 'primary'
}: EmailButtonProps) {
  const buttonStyle = variant === 'primary' ? primaryButton : secondaryButton;

  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  );
}

const primaryButton = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '600',
  display: 'inline-block',
  textAlign: 'center' as const
};

const secondaryButton = {
  backgroundColor: '#f3f4f6',
  color: '#1f2937',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '600',
  display: 'inline-block',
  textAlign: 'center' as const
};
