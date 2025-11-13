/**
 * Email Components Index
 * Export all reusable email components
 */

export { EmailLayout } from './EmailLayout';
export { default as EmailHeader } from './EmailHeader';
export { default as EmailFooter } from './EmailFooter';
export { EmailButton } from './EmailButton';
export { EmailText } from './EmailText';
export { EmailList } from './EmailList';
export { EmailAlert } from './EmailAlert';
export { EmailDivider } from './EmailDivider';
export { EmailCard } from './EmailCard';
export { EmailSection } from './EmailSection';
export { default as CourseCard } from './CourseCard';

// Re-export commonly used React Email components
export {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Img,
  Hr,
  Button,
  Preview,
} from '@react-email/components';
