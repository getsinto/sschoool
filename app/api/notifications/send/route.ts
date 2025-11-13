import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/notifications/delivery';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const authResult = await supabase.auth.getUser();
    
    if (authResult.error || !authResult.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = authResult.data.user;

    // Check if user has admin or teacher role
    const profileResult = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (!profileResult.data || !['admin', 'teacher'].includes(profileResult.data.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requestBody = await request.json();
    const userId = requestBody.userId;
    const notificationType = requestBody.type;
    const notificationTitle = requestBody.title;
    const notificationMessage = requestBody.message;
    const notificationPriority = requestBody.priority || 'normal';
    const notificationActionUrl = requestBody.actionUrl;
    const notificationIcon = requestBody.icon;
    const notificationMetadata = requestBody.metadata;

    if (!userId || !notificationType || !notificationTitle || !notificationMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notificationId = await NotificationService.send({
      user_id: userId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      priority: notificationPriority,
      action_url: notificationActionUrl,
      icon: notificationIcon,
      data: notificationMetadata
    });

    if (!notificationId) {
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true, notificationId });
  } catch (error) {
    console.error('Error in send notification API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
