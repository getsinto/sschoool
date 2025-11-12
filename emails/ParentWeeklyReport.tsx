import * as React from 'react';
import { Text, Section, Heading, Hr, Row, Column } from '@react-email/components';
import EmailLayout from '@/components/email/EmailLayout';
import EmailButton from '@/components/email/EmailButton';

interface ParentWeeklyReportProps {
  parentName: string;
  childName: string;
  weekStart: string;
  weekEnd: string;
  coursesProgress: Array<{ name: string; progress: number }>;
  grades: Array<{ assessment: string; grade: string; course: string }>;
  attendance: { attended: number; total: number; percentage: number };
  upcomingSchedule: Array<{ title: string; date: string; type: string }>;
  teacherComments?: string[];
  reportUrl: string;
}

export default function ParentWeeklyReport({
  parentName = 'Parent',
  childName = 'Student',
  weekStart = 'Jan 1',
  weekEnd = 'Jan 7',
  coursesProgress = [],
  grades = [],
  attendance = { attended: 8, total: 10, percentage: 80 },
  upcomingSchedule = [],
  teacherComments = [],
  reportUrl = 'https://yourdomain.com/parent/reports',
}: ParentWeeklyReportProps) {
  return (
    <EmailLayout preview={`Weekly Progress Report for ${childName}`}>
      <Heading style={heading}>📊 Weekly Progress Report</Heading>
      
      <Text style={text}>Hi {parentName},</Text>
      
      <Text style={text}>
        Here's {childName}'s progress summary for the week of {weekStart} - {weekEnd}.
      </Text>

      {/* Attendance Summary */}
      <Section style={sectionBox}>
        <Heading as="h2" style={sectionHeading}>📅 Attendance</Heading>
        <Text style={attendanceText}>
          {childName} attended <strong>{attendance.attended} out of {attendance.total}</strong> scheduled classes
        </Text>
        <Section style={progressBar}>
          <Section style={{...progressFill, width: `${attendance.percentage}%`}} />
        </Section>
        <Text style={percentageText}>{attendance.percentage}% Attendance Rate</Text>
      </Section>

      {/* Course Progress */}
      {coursesProgress.length > 0 && (
        <Section style={sectionBox}>
          <Heading as="h2" style={sectionHeading}>📚 Course Progress</Heading>
          {coursesProgress.map((course, index) => (
            <Section key={index} style={courseItem}>
              <Text style={courseName}>{course.name}</Text>
              <Section style={progressBar}>
                <Section style={{...progressFill, width: `${course.progress}%`}} />
              </Section>
              <Text style={progressText}>{course.progress}% Complete</Text>
            </Section>
          ))}
        </Section>
      )}

      {/* Recent Grades */}
      {grades.length > 0 && (
        <Section style={sectionBox}>
          <Heading as="h2" style={sectionHeading}>🎯 Recent Grades</Heading>
          {grades.map((grade, index) => (
            <Row key={index} style={gradeRow}>
              <Column style={gradeColumn}>
                <Text style={gradeAssessment}>{grade.assessment}</Text>
                <Text style={gradeCourse}>{grade.course}</Text>
              </Column>
              <Column style={gradeScoreColumn}>
                <Text style={gradeScore}>{grade.grade}</Text>
              </Column>
            </Row>
          ))}
        </Section>
      )}

      {/* Upcoming Schedule */}
      {upcomingSchedule.length > 0 && (
        <Section style={sectionBox}>
          <Heading as="h2" style={sectionHeading}>📆 Upcoming This Week</Heading>
          {upcomingSchedule.map((item, index) => (
            <Section key={index} style={scheduleItem}>
              <Text style={scheduleType}>{item.type}</Text>
              <Text style={scheduleTitle}>{item.title}</Text>
              <Text style={scheduleDate}>{item.date}</Text>
            </Section>
          ))}
        </Section>
      )}

      {/* Teacher Comments */}
      {teacherComments && teacherComments.length > 0 && (
        <Section style={commentsBox}>
          <Heading as="h2" style={sectionHeading}>💬 Teacher Comments</Heading>
          {teacherComments.map((comment, index) => (
            <Text key={index} style={commentText}>
              "{comment}"
            </Text>
          ))}
        </Section>
      )}

      <EmailButton href={reportUrl}>
        View Full Report
      </EmailButton>

      <Text style={text}>
        Keep up the great work supporting {childName}'s learning journey!
      </Text>

      <Text style={text}>
        Best regards,<br />
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

const sectionBox = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#32325d',
  margin: '0 0 16px',
};

const attendanceText = {
  fontSize: '16px',
  color: '#525f7f',
  margin: '0 0 12px',
};

const progressBar = {
  width: '100%',
  height: '8px',
  backgroundColor: '#e6ebf1',
  borderRadius: '4px',
  overflow: 'hidden',
  margin: '8px 0',
};

const progressFill = {
  height: '100%',
  backgroundColor: '#28a745',
  borderRadius: '4px',
};

const percentageText = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#28a745',
  margin: '4px 0 0',
};

const courseItem = {
  marginBottom: '16px',
};

const courseName = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#32325d',
  margin: '0 0 8px',
};

const progressText = {
  fontSize: '13px',
  color: '#8898aa',
  margin: '4px 0 0',
};

const gradeRow = {
  borderBottom: '1px solid #e6ebf1',
  padding: '12px 0',
};

const gradeColumn = {
  width: '70%',
};

const gradeScoreColumn = {
  width: '30%',
  textAlign: 'right' as const,
};

const gradeAssessment = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#32325d',
  margin: '0 0 4px',
};

const gradeCourse = {
  fontSize: '13px',
  color: '#8898aa',
  margin: '0',
};

const gradeScore = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#28a745',
  margin: '0',
};

const scheduleItem = {
  borderLeft: '3px solid #556cd6',
  paddingLeft: '12px',
  marginBottom: '12px',
};

const scheduleType = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#556cd6',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
  letterSpacing: '0.5px',
};

const scheduleTitle = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#32325d',
  margin: '0 0 4px',
};

const scheduleDate = {
  fontSize: '13px',
  color: '#8898aa',
  margin: '0',
};

const commentsBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const commentText = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#856404',
  margin: '0 0 12px',
  fontStyle: 'italic',
};
