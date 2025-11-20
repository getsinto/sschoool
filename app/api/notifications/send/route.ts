import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      userId, 
      type, 
      title, 
      message, 
      priority = 'normal',
      actionUrl,
      icon,
      data: notificationData = {}
    } = body;

    // Use current user if userId not provided
    const targetUserId = userId || user.id;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, title, message' 
      }, { status: 400 });
    }

    // Create notification in database
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type,
        title,
        message,
        data: notificationData,
        priority,
        action_url: actionUrl,
        icon,
        read: false
      })
      .select()
      .single();

    if (insertError || !notification) {
      console.error('Error creating notification:', insertError);
      return NextResponse.json({ 
        error: 'Failed to create notification' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      notificationId: notification.id,
      message: 'Notification created successfully'
    });

  } catch (error) {
    console.error('Error in send notification API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
