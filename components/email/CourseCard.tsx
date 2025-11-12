import * as React from 'react';
import { Section, Img, Text, Row, Column } from '@react-email/components';

interface CourseCardProps {
  title: string;
  instructor?: string;
  thumbnail?: string;
  description?: string;
}

export default function CourseCard({ title, instructor, thumbnail, description }: CourseCardProps) {
  return (
    <Section style={card}>
      {thumbnail && (
        <Img
          src={thumbnail}
          alt={title}
          width="100%"
          height="200"
          style={thumbnail_style}
        />
      )}
      <Section style={cardContent}>
        <Text style={courseTitle}>{title}</Text>
        {instructor && (
          <Text style={instructorText}>
            Instructor: <strong>{instructor}</strong>
          </Text>
        )}
        {description && (
          <Text style={descriptionText}>{description}</Text>
        )}
      </Section>
    </Section>
  );
}

const card = {
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  overflow: 'hidden',
  margin: '16px 0',
};

const thumbnail_style = {
  objectFit: 'cover' as const,
  display: 'block',
};

const cardContent = {
  padding: '16px',
};

const courseTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#32325d',
  margin: '0 0 8px',
};

const instructorText = {
  fontSize: '14px',
  color: '#525f7f',
  margin: '4px 0',
};

const descriptionText = {
  fontSize: '14px',
  color: '#525f7f',
  lineHeight: '20px',
  margin: '8px 0 0',
};
