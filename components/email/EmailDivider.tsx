import { Hr } from '@react-email/components';

interface EmailDividerProps {
  margin?: string;
  color?: string;
}

export function EmailDivider({
  margin = '24px 0',
  color = '#e5e7eb'
}: EmailDividerProps) {
  return <Hr style={{ borderColor: color, margin }} />;
}

export default EmailDivider;
