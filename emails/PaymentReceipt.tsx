import * as React from 'react';
import { Text, Section, Heading, Hr, Row, Column } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface PaymentReceiptProps {
  customerName: string;
  amount: number;
  currency: string;
  transactionId: string;
  courseName: string;
  invoiceUrl?: string;
  date: string;
}

export default function PaymentReceipt({
  customerName = 'Customer',
  amount = 0,
  currency = 'USD',
  transactionId = 'TXN123456',
  courseName = 'Course Name',
  invoiceUrl,
  date = new Date().toLocaleDateString(),
}: PaymentReceiptProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);

  return (
    <EmailLayout preview="Payment receipt for your course purchase">
      <Heading style={heading}>Payment Received</Heading>
      
      <Section style={successBox}>
        <Text style={successText}>
          ✓ Your payment was successful!
        </Text>
      </Section>

      <Text style={text}>Hi {customerName},</Text>
      
      <Text style={text}>
        Thank you for your purchase! This email confirms that we've received your 
        payment for <strong>{courseName}</strong>.
      </Text>

      <Section style={receiptBox}>
        <Heading as="h2" style={receiptHeading}>Payment Details</Heading>
        
        <Hr style={divider} />
        
        <Row style={detailRow}>
          <Column style={labelColumn}>
            <Text style={label}>Course:</Text>
          </Column>
          <Column style={valueColumn}>
            <Text style={value}>{courseName}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={labelColumn}>
            <Text style={label}>Amount Paid:</Text>
          </Column>
          <Column style={valueColumn}>
            <Text style={value}>{formattedAmount}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={labelColumn}>
            <Text style={label}>Transaction ID:</Text>
          </Column>
          <Column style={valueColumn}>
            <Text style={valueSmall}>{transactionId}</Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={labelColumn}>
            <Text style={label}>Date:</Text>
          </Column>
          <Column style={valueColumn}>
            <Text style={value}>{date}</Text>
          </Column>
        </Row>

        <Hr style={divider} />

        <Row style={totalRow}>
          <Column style={labelColumn}>
            <Text style={totalLabel}>Total:</Text>
          </Column>
          <Column style={valueColumn}>
            <Text style={totalValue}>{formattedAmount}</Text>
          </Column>
        </Row>
      </Section>

      {invoiceUrl && (
        <EmailButton href={invoiceUrl}>
          Download Invoice
        </EmailButton>
      )}

      <Section style={accessSection}>
        <Text style={accessText}>
          <strong>What's Next?</strong><br />
          Your course is now available in your dashboard. Start learning right away!
        </Text>
      </Section>

      <Text style={text}>
        If you have any questions about your purchase, please don't hesitate to 
        contact our support team.
      </Text>

      <Text style={text}>
        Thank you for choosing our platform!<br />
        The Education Platform Team
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#32325d',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const successBox = {
  backgroundColor: '#d4edda',
  border: '2px solid #28a745',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const successText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#155724',
  margin: '0',
};

const receiptBox = {
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  backgroundColor: '#ffffff',
};

const receiptHeading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#32325d',
  margin: '0 0 16px',
};

const divider = {
  borderColor: '#e6ebf1',
  margin: '16px 0',
};

const detailRow = {
  marginBottom: '12px',
};

const labelColumn = {
  width: '40%',
  verticalAlign: 'top' as const,
};

const valueColumn = {
  width: '60%',
  verticalAlign: 'top' as const,
};

const label = {
  fontSize: '14px',
  color: '#8898aa',
  margin: '0',
};

const value = {
  fontSize: '16px',
  color: '#32325d',
  fontWeight: '500',
  margin: '0',
};

const valueSmall = {
  fontSize: '14px',
  color: '#32325d',
  fontWeight: '500',
  margin: '0',
  wordBreak: 'break-all' as const,
};

const totalRow = {
  marginTop: '16px',
};

const totalLabel = {
  fontSize: '18px',
  color: '#32325d',
  fontWeight: '600',
  margin: '0',
};

const totalValue = {
  fontSize: '24px',
  color: '#28a745',
  fontWeight: '700',
  margin: '0',
};

const accessSection = {
  backgroundColor: '#f6f9fc',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const accessText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0',
};
