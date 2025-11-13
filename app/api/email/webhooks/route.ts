import { NextRequest, NextResponse } from 'next/server';
import { EmailAnalyticsService } from '@/lib/email/analytics';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, data' },
        { status: 400 }
      );
    }

    const emailJobId = data.emailJobId || data.email_job_id;

    if (!emailJobId) {
      return NextResponse.json(
        { error: 'Email job ID is required in data' },
        { status: 400 }
      );
    }

    // Handle different webhook events
    switch (type) {
      case 'email.delivered':
        await EmailAnalyticsService.recordDelivery(emailJobId);
        break;

      case 'email.opened':
        await EmailAnalyticsService.recordOpen(emailJobId);
        break;

      case 'email.clicked':
        await EmailAnalyticsService.recordClick(emailJobId);
        break;

      case 'email.bounced':
        await EmailAnalyticsService.recordBounce(
          emailJobId,
          data.bounceType || 'soft',
          data.reason
        );
        break;

      case 'email.complained':
        await EmailAnalyticsService.recordComplaint(emailJobId);
        break;

      default:
        console.warn(`Unknown webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
