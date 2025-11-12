import { Img, Section, Row, Column } from '@react-email/components';

interface EmailHeaderProps {
  logoUrl?: string;
  companyName?: string;
}

export default function EmailHeader({
  logoUrl = 'https://via.placeholder.com/150x50',
  companyName = 'Online Education Platform'
}: EmailHeaderProps) {
  return (
    <Section style={header}>
      <Row>
        <Column>
          <Img
            src={logoUrl}
            alt={companyName}
            width="150"
            height="50"
            style={logo}
          />
        </Column>
      </Row>
    </Section>
  );
}

const header = {
  backgroundColor: '#ffffff',
  padding: '20px 0',
  borderBottom: '1px solid #e5e7eb'
};

const logo = {
  margin: '0 auto',
  display: 'block'
};
