import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user notification preferences
    const { data: preferences, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(preferences || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notification_type, in_app_enabled, email_enabled, push_enabled, sms_enabled } = body;

    // Upsert preference
    const { data: preference, error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: user.id,
        notification_type,
        in_app_enabled: in_app_enabled ?? true,
        email_enabled: email_enabled ?? false,
        push_enabled: push_enabled ?? false,
        sms_enabled: sms_enabled ?? false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(preference);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
