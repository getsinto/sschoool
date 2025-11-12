import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { createElement } from 'react';
import WelcomeEmail from '@/emails/WelcomeEmail';
import EmailVerification from '@/emails/EmailVerification';
import PasswordReset from '@/emails/PasswordReset';
import EnrollmentConfirmation from '@/emails/EnrollmentConfirmation';
import PaymentReceipt from '@/emails/PaymentReceipt';
import LiveClassReminder from '@/emails/LiveClassReminder';
import AssignmentDueReminder from '@/emails/AssignmentDueReminder';
import QuizAvailable from '@/emails/QuizAvailable';
import GradePosted from '@/emails/GradePosted';
import CertificateEarned from '@/emails/CertificateEarned';
import Announcement from '@/emails/Announcement';
import TeacherMessage from '@/emails/TeacherMessage';
import ParentWeeklyReport from '@/emails/ParentWeeklyReport';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, data, format = 'html' } = body;

    if (!template) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    // Get the email component based on template name
    const emailComponent = getEmailComponent(template, data);

    if (!emailComponent) {
      return NextResponse.json(
        { error: `Unknown template: ${template}` },
        { status: 400 }
      );
    }

    // Render the email
    let rendered;
    if (format === 'html') {
      rendered = render(emailComponent);
    } else if (format === 'text') {
      rendered = render(emailComponent, { plainText: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use "html" or "text"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
      format,
      preview: rendered
    });

  } catch (error) {
    console.error('Email preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

// Helper function to get email component
function getEmailComponent(template: string, data: any) {
  const sampleData = getSampleData(template, data);

  switch (template) {
    case 'welcome':
      return createElement(WelcomeEmail, sampleData);
    case 'email-verification':
      return createElement(EmailVerification, sampleData);
    case 'password-reset':
      return createElement(PasswordReset, sampleData);
    case 'enrollment-confirmation':
      return createElement(EnrollmentConfirmation, sampleData);
    case 'payment-receipt':
      return createElement(PaymentReceipt, sampleData);
    case 'live-class-reminder':
      return createElement(LiveClassReminder, sampleData);
    case 'assignment-due-reminder':
      return createElement(AssignmentDueReminder, sampleData);
    case 'quiz-available':
      return createElement(QuizAvailable, sampleData);
    case 'grade-posted':
      return createElement(GradePosted, sampleData);
    case 'certificate-earned':
      return createElement(CertificateEarned, sampleData);
    case 'announcement':
      return createElement(Announcement, sampleData);
    case 'teacher-message':
      return createElement(TeacherMessage, sampleData);
    case 'parent-weekly-report':
      return createElement(ParentWeeklyReport, sampleData);
    default:
      return null;
  }
}

// Helper function to provide sample data for preview
function getSampleData(template: string, providedData?: any) {
  const defaults: Record<string, any> = {
    'welcome': {
      firstName: 'John',
      role: 'student',
      ...providedData
    },
    'email-verification': {
      firstName: 'John',
      verificationUrl: 'https://example.com/verify?token=sample',
      ...providedData
    },
    'password-reset': {
      firstName: 'John',
      resetUrl: 'https://example.com/reset?token=sample',
      ...providedData
    },
    'enrollment-confirmation': {
      studentName: 'John Doe',
      courseName: 'Introduction to Programming',
      courseImage: 'https://via.placeholder.com/600x300',
      startDate: '2024-01-15',
      instructor: 'Dr. Jane Smith',
      courseUrl: 'https://example.com/courses/intro-programming',
      ...providedData
    },
    'payment-receipt': {
      customerName: 'John Doe',
      orderId: 'ORD-12345',
      date: new Date().toISOString(),
      items: [
        { name: 'Introduction to Programming', price: 99.99 }
      ],
      subtotal: 99.99,
      tax: 9.99,
      total: 109.98,
      paymentMethod: 'Credit Card',
      ...providedData
    },
    'live-class-reminder': {
      studentName: 'John',
      className: 'Advanced Mathematics',
      startTime: '2024-01-15T14:00:00Z',
      duration: 60,
      instructor: 'Dr. Smith',
      meetingUrl: 'https://example.com/meeting/12345',
      ...providedData
    },
    'assignment-due-reminder': {
      studentName: 'John',
      assignmentTitle: 'Chapter 5 Exercises',
      courseName: 'Mathematics 101',
      dueDate: '2024-01-20T23:59:59Z',
      assignmentUrl: 'https://example.com/assignments/123',
      ...providedData
    },
    'quiz-available': {
      studentName: 'John',
      quizTitle: 'Mid-term Quiz',
      courseName: 'Science 101',
      availableUntil: '2024-01-25T23:59:59Z',
      duration: 45,
      quizUrl: 'https://example.com/quizzes/456',
      ...providedData
    },
    'grade-posted': {
      studentName: 'John',
      assignmentTitle: 'Final Project',
      courseName: 'Computer Science',
      grade: 'A',
      score: 95,
      maxScore: 100,
      feedback: 'Excellent work! Your implementation was clean and well-documented.',
      viewUrl: 'https://example.com/grades/789',
      ...providedData
    },
    'certificate-earned': {
      studentName: 'John Doe',
      courseName: 'Web Development Bootcamp',
      completionDate: '2024-01-15',
      certificateUrl: 'https://example.com/certificates/abc123',
      ...providedData
    },
    'announcement': {
      title: 'Important Update',
      content: 'We are excited to announce new features coming to the platform next week!',
      priority: 'high',
      actionUrl: 'https://example.com/announcements/123',
      actionText: 'Read More',
      ...providedData
    },
    'teacher-message': {
      studentName: 'John',
      teacherName: 'Dr. Smith',
      subject: 'Great progress this week!',
      message: 'I wanted to let you know that your recent assignment showed excellent understanding of the concepts.',
      replyUrl: 'https://example.com/messages/reply/456',
      ...providedData
    },
    'parent-weekly-report': {
      parentName: 'Mrs. Johnson',
      studentName: 'Emily',
      weekStart: '2024-01-08',
      weekEnd: '2024-01-14',
      attendance: { present: 4, absent: 1, total: 5 },
      grades: [
        { course: 'Mathematics', grade: 'A', trend: 'up' },
        { course: 'Science', grade: 'B+', trend: 'stable' }
      ],
      assignments: { completed: 8, pending: 2, total: 10 },
      upcomingEvents: [
        { title: 'Parent-Teacher Meeting', date: '2024-01-20' }
      ],
      dashboardUrl: 'https://example.com/parent/dashboard',
      ...providedData
    }
  };

  return defaults[template] || providedData || {};
}
