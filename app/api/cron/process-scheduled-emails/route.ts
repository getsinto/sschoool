import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email/resend';

export const dynamic = 'force-dynamic';

/**
 * Cron job to process scheduled emails
 * This should be called every 5-15 minutes via Vercel Cron or external service
 * 
 * Vercel Cron configuration (add to vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-scheduled-emails",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const now = new Date().toISOString();

    // Find scheduled emails that are ready to send
    const { data: scheduledEmails, error: fetchError } = await supabase
      .from('email_jobs')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(50); // Process in batches

    if (fetchError) {
      console.error('Error fetching scheduled emails:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled emails' },
        { status: 500 }
      );
    }

    if (!scheduledEmails || scheduledEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled emails to process',
        processed: 0
      });
    }

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each scheduled email
    for (const job of scheduledEmails) {
      try {
        results.processed++;

        // Update status to processing
        await supabase
          .from('email_jobs')
          .update({ status: 'processing' })
          .eq('id', job.id);

        // Send the email
        const result = await EmailService.sendEmail({
          to: job.recipient,
          subject: job.subject,
          template: job.template,
          data: job.data || {}
        });

        if (result.success) {
          // Update status to sent
          await supabase
            .from('email_jobs')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', job.id);

          results.succeeded++;
        } else {
          throw new Error(result.error || 'Failed to send email');
        }

      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Job ${job.id}: ${errorMessage}`);

        // Update job with error
        await supabase
          .from('email_jobs')
          .update({ 
            status: 'failed',
            error_message: errorMessage
          })
          .eq('id', job.id);

        console.error(`Failed to process scheduled email ${job.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} scheduled emails`,
      ...results
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
