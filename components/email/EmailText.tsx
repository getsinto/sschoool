import { Text } from '@react-email/components';

interface EmailTextProps {
  children: React.ReactNode;
  variant?: 'body' | 'heading' | 'subheading' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function EmailText({
  children,
  variant = 'body',
  color,
  align = 'left'
}: EmailTextProps) {
  const styles = {
    body: bodyText,
    heading: headingText,
    subheading: subheadingText,
    caption: captionText
  };

  const style = {
    ...styles[variant],
    ...(color && { color }),
    textAlign: align
  };

  return <Text style={style}>{children}</Text>;
}

const bodyText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '16px 0'
};

const headingText = {
  fontSize: '24px',
  lineHeight: '32px',
  fontWeight: '700',
  color: '#111827',
  margin: '24px 0 16px'
};

const subheadingText = {
  fontSize: '20px',
  lineHeight: '28px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '20px 0 12px'
};

const captionText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  margin: '8px 0'
};

export default EmailText;
