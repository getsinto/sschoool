import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/resend';
import { EmailPreferences } from '@/lib/email/preferences';
import { emailQueue } from '@/lib/email/queue';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recipients, 
      subject, 
      template, 
      data, 
      batchSize = 50,
      priority = 3,
      checkPreferences = true,
      segment 
    } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!subject || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, template' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        name: data.campaignName || `Bulk Email - ${new Date().toISOString()}`,
        subject,
        template,
        segment: segment || 'custom',
        total_recipients: recipients.length,
        status: 'sending',
        created_by: data.adminId
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Error creating campaign:', campaignError);
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    let filteredRecipients = recipients;

    if (checkPreferences) {
      const category = getEmailCategory(template);
      if (category) {
        const validRecipients = [];
        
        for (const recipient of recipients) {
          if (typeof recipient === 'object' && recipient.userId) {
            const { canSend } = await EmailPreferences.canSendEmail(recipient.userId, category);
            if (canSend) {
              validRecipients.push(recipient.email || recipient);
            }
          } else {
            validRecipients.push(recipient);
          }
        }
        
        filteredRecipients = validRecipients;
      }
    }

    const jobId = await emailQueue.addBulkToQueue(
      filteredRecipients,
      subject,
      template,
      { ...data, campaignId: campaign.id },
      priority
    );

    await supabase
      .from('email_campaigns')
      .update({
        total_recipients: filteredRecipients.length
      })
      .eq('id', campaign.id);

    return NextResponse.json({
      success: true,
      jobId,
      campaignId: campaign.id,
      totalRecipients: recipients.length,
      filteredRecipients: filteredRecipients.length,
      message: 'Bulk email queued for sending'
    });

  } catch (error) {
    console.error('Bulk email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk email' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const { data: jobs, error: jobsError } = await supabase
      .from('email_jobs')
      .select('status')
      .eq('data->>campaignId', campaignId);

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
    }

    const jobStats = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0
    };

    jobs?.forEach(job => {
      jobStats[job.status as keyof typeof jobStats]++;
    });

    return NextResponse.json({
      campaign,
      progress: {
        ...jobStats,
        total: jobs?.length || 0,
        percentage: jobs?.length ? Math.round((jobStats.sent / jobs.length) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching bulk email status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
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
