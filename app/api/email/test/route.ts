import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template, data } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const testTemplate = template || 'welcome';
    const testData = data || getTestData(testTemplate);

    // Send test email
    const result = await EmailService.sendEmail(
      to,
      `[TEST] ${getTestSubject(testTemplate)}`,
      testTemplate,
      testData
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `Test email sent to ${to}`,
      template: testTemplate
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}

// Helper function to get test subject
function getTestSubject(template: string): string {
  const subjects: Record<string, string> = {
    'welcome': 'Welcome to Our Platform',
    'email-verification': 'Verify Your Email Address',
    'password-reset': 'Reset Your Password',
    'enrollment-confirmation': 'Course Enrollment Confirmed',
    'payment-receipt': 'Payment Receipt',
    'live-class-reminder': 'Live Class Reminder',
    'assignment-due-reminder': 'Assignment Due Soon',
    'quiz-available': 'New Quiz Available',
    'grade-posted': 'Grade Posted',
    'certificate-earned': 'Certificate Earned',
    'announcement': 'Important Announcement',
    'teacher-message': 'Message from Your Teacher',
    'parent-weekly-report': 'Weekly Progress Report'
  };

  return subjects[template] || 'Test Email';
}

// Helper function to get test data
function getTestData(template: string): any {
  const testData: Record<string, any> = {
    'welcome': {
      firstName: 'Test User',
      role: 'student'
    },
    'email-verification': {
      firstName: 'Test User',
      verificationUrl: 'https://example.com/verify?token=test'
    },
    'password-reset': {
      firstName: 'Test User',
      resetUrl: 'https://example.com/reset?token=test'
    },
    'enrollment-confirmation': {
      studentName: 'Test Student',
      courseName: 'Test Course',
      courseImage: 'https://via.placeholder.com/600x300',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructor: 'Test Instructor',
      courseUrl: 'https://example.com/courses/test'
    },
    'payment-receipt': {
      customerName: 'Test Customer',
      orderId: 'TEST-' + Date.now(),
      date: new Date().toISOString(),
      items: [
        { name: 'Test Course', price: 99.99 }
      ],
      subtotal: 99.99,
      tax: 9.99,
      total: 109.98,
      paymentMethod: 'Test Payment'
    },
    'live-class-reminder': {
      studentName: 'Test Student',
      className: 'Test Class',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      instructor: 'Test Instructor',
      meetingUrl: 'https://example.com/meeting/test'
    },
    'assignment-due-reminder': {
      studentName: 'Test Student',
      assignmentTitle: 'Test Assignment',
      courseName: 'Test Course',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignmentUrl: 'https://example.com/assignments/test'
    },
    'quiz-available': {
      studentName: 'Test Student',
      quizTitle: 'Test Quiz',
      courseName: 'Test Course',
      availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      quizUrl: 'https://example.com/quizzes/test'
    },
    'grade-posted': {
      studentName: 'Test Student',
      assignmentTitle: 'Test Assignment',
      courseName: 'Test Course',
      grade: 'A',
      score: 95,
      maxScore: 100,
      feedback: 'This is a test feedback message.',
      viewUrl: 'https://example.com/grades/test'
    },
    'certificate-earned': {
      studentName: 'Test Student',
      courseName: 'Test Course',
      completionDate: new Date().toISOString().split('T')[0],
      certificateUrl: 'https://example.com/certificates/test'
    },
    'announcement': {
      title: 'Test Announcement',
      content: 'This is a test announcement message.',
      priority: 'medium',
      actionUrl: 'https://example.com/announcements/test',
      actionText: 'View Details'
    },
    'teacher-message': {
      studentName: 'Test Student',
      teacherName: 'Test Teacher',
      subject: 'Test Message',
      message: 'This is a test message from your teacher.',
      replyUrl: 'https://example.com/messages/reply/test'
    },
    'parent-weekly-report': {
      parentName: 'Test Parent',
      studentName: 'Test Student',
      weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weekEnd: new Date().toISOString().split('T')[0],
      attendance: { present: 4, absent: 1, total: 5 },
      grades: [
        { course: 'Test Course 1', grade: 'A', trend: 'up' },
        { course: 'Test Course 2', grade: 'B+', trend: 'stable' }
      ],
      assignments: { completed: 8, pending: 2, total: 10 },
      upcomingEvents: [
        { title: 'Test Event', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
      ],
      dashboardUrl: 'https://example.com/parent/dashboard'
    }
  };

  return testData[template] || {};
}
