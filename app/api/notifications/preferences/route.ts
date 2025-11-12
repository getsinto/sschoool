import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', error);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        preferences: {
          email_notifications: true,
          push_notifications: false,
          sms_notifications: false,
          notification_types: {
            course: true,
            assignment: true,
            quiz: true,
            grade: true,
            live_class: true,
            payment: true,
            message: true,
            announcement: true,
            system: true
          },
          quiet_hours: {
            enabled: false,
            start: '22:00',
            end: '07:00'
          }
        }
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error in preferences API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await request.json();

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving preferences:', error);
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in save preferences API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
