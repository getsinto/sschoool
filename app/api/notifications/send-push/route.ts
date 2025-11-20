import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification, sendBulkPushNotifications } from '@/lib/notifications/push';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, body: messageBody, data, url } = body;

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId || user.id);

    if (subError || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        error: 'No push subscriptions found for user' 
      }, { status: 404 });
    }

    // Convert to push subscription format
    const pushSubscriptions = subscriptions.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    }));

    // Send push notification
    const result = await sendBulkPushNotifications(pushSubscriptions, {
      title: title || 'New Notification',
      body: messageBody || '',
      data: data || {},
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png'
    });

    return NextResponse.json({ 
      success: true,
      sent: result.success,
      failed: result.failed
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
