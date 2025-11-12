import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/resend';
import { EmailPreferences } from '@/lib/email/preferences';
import { emailQueue } from '@/lib/email/queue';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, template, data, priority = 5, checkPreferences = true } = body;

    if (!to || !subject || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, template' },
        { status: 400 }
      );
    }

    if (checkPreferences && data.userId) {
      const category = getEmailCategory(template);
      if (category) {
        const { canSend } = await EmailPreferences.canSendEmail(data.userId, category);
        if (!canSend) {
          return NextResponse.json(
            { message: 'Email not sent due to user preferences', sent: false },
            { status: 200 }
          );
        }
      }
    }

    const jobId = await emailQueue.addToQueue({
      to,
      subject,
      template,
      data
    }, priority);

    const supabase = createClient();
    await supabase.from('email_jobs').insert({
      id: jobId,
      template,
      recipient: to,
      subject,
      data,
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Email queued for sending'
    });

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function getEmailCategory(template: string): string | null {
  const templateCategoryMap: Record<string, string> = {
    'welcome': 'course-updates',
    'email-verification': 'course-updates',
    'password-reset': 'course-updates',
    'enrollment-confirmation': 'course-updates',
    'payment-receipt': 'payment-receipts',
    'live-class-reminder': 'live-class-reminders',
    'assignment-due-reminder': 'assignment-reminders',
    'quiz-available': 'course-updates',
    'grade-posted': 'grade-notifications',
    'certificate-earned': 'course-updates',
    'announcement': 'announcements',
    'teacher-message': 'messages',
    'parent-weekly-report': 'course-updates'
  };

  return templateCategoryMap[template] || null;
}
