import { Section, Text } from '@react-email/components';

interface EmailListProps {
  items: string[];
  ordered?: boolean;
}

export function EmailList({ items, ordered = false }: EmailListProps) {
  return (
    <Section style={listContainer}>
      {items.map((item, index) => (
        <Text key={index} style={listItem}>
          {ordered ? `${index + 1}. ` : '• '}
          {item}
        </Text>
      ))}
    </Section>
  );
}

const listContainer = {
  margin: '16px 0'
};

const listItem = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '8px 0',
  paddingLeft: '8px'
};

export default EmailList;
