import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePushSubscription, sendTestPushNotification } from '@/lib/notifications/push';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription, sendTest } = body;

    // Validate subscription format
    if (!validatePushSubscription(subscription)) {
      return NextResponse.json({ error: 'Invalid subscription format' }, { status: 400 });
    }

    // Extract subscription details
    const { endpoint, keys } = subscription;
    const userAgent = request.headers.get('user-agent') || '';

    // Store push subscription in database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,endpoint'
      });

    if (error) {
      console.error('Error saving push subscription:', error);
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    // Send test notification if requested
    if (sendTest) {
      try {
        await sendTestPushNotification(subscription);
      } catch (testError) {
        console.error('Error sending test notification:', testError);
        // Don't fail the request if test fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in subscribe-push API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
    }

    // Remove push subscription from database
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Error removing push subscription:', error);
      return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in unsubscribe-push API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
