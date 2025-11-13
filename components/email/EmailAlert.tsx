import { Section, Text } from '@react-email/components';

interface EmailAlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export function EmailAlert({ children, variant = 'info' }: EmailAlertProps) {
  const styles = {
    info: { backgroundColor: '#dbeafe', borderColor: '#3b82f6', color: '#1e40af' },
    success: { backgroundColor: '#d1fae5', borderColor: '#10b981', color: '#065f46' },
    warning: { backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' },
    error: { backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }
  };

  const variantStyle = styles[variant];

  return (
    <Section style={{ ...alert, ...variantStyle }}>
      <Text style={{ ...alertText, color: variantStyle.color }}>
        {children}
      </Text>
    </Section>
  );
}

const alert = {
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid',
  margin: '16px 0'
};

const alertText = {
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0'
};

export default EmailAlert;
