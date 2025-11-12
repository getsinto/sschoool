import { NextRequest, NextResponse } from 'next/server';
import { EmailScheduler } from '@/lib/email/scheduler';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, template, data, scheduledFor, priority = 5 } = body;

    // Validate required fields
    if (!to || !subject || !template || !scheduledFor) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, template, scheduledFor' },
        { status: 400 }
      );
    }

    // Validate scheduledFor is in the future
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Create scheduled email job
    const { data: job, error } = await supabase
      .from('email_jobs')
      .insert({
        template,
        recipient: to,
        subject,
        data,
        status: 'scheduled',
        scheduled_for: scheduledFor,
        priority
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating scheduled email:', error);
      return NextResponse.json(
        { error: 'Failed to schedule email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      scheduledFor: job.scheduled_for,
      message: 'Email scheduled successfully'
    });

  } catch (error) {
    console.error('Schedule email error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule email' },
      { status: 500 }
    );
  }
}

// GET endpoint to list scheduled emails
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'scheduled';
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createClient();

    const { data: jobs, error } = await supabase
      .from('email_jobs')
      .select('*')
      .eq('status', status)
      .order('scheduled_for', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching scheduled emails:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled emails' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length
    });

  } catch (error) {
    console.error('Error fetching scheduled emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled emails' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to cancel scheduled email
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if job is still scheduled
    const { data: job, error: fetchError } = await supabase
      .from('email_jobs')
      .select('status')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Can only cancel scheduled emails' },
        { status: 400 }
      );
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from('email_jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error cancelling email:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel email error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel email' },
      { status: 500 }
    );
  }
}
