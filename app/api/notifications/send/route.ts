import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/notifications/delivery';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin or teacher role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, type, title, message, priority, actionUrl, icon, metadata } = await request.json();

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notificationService = new NotificationService();
    const notification = await notificationService.sendNotification({
      userId,
      type,
      title,
      message,
      priority: priority || 'normal',
      actionUrl,
      icon,
      metadata
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error in send notification API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
