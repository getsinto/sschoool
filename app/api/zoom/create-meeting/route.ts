import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createMeeting, CreateMeetingParams } from '@/lib/zoom/meetings';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      topic,
      start_time,
      duration,
      timezone,
      password,
      agenda,
      settings,
      recurrence
    } = body;

    // Create Zoom meeting
    const meetingParams: CreateMeetingParams = {
      topic,
      type: recurrence ? 8 : 2, // 8 for recurring, 2 for scheduled
      start_time,
      duration: duration || 60,
      timezone: timezone || 'UTC',
      password,
      agenda,
      settings: {
        host_video: settings?.host_video ?? true,
        participant_video: settings?.participant_video ?? true,
        join_before_host: settings?.join_before_host ?? false,
        mute_upon_entry: settings?.mute_upon_entry ?? true,
        waiting_room: settings?.waiting_room ?? true,
        auto_recording: settings?.auto_recording || 'cloud',
        ...settings
      },
      recurrence
    };

    const meeting = await createMeeting('me', meetingParams);

    return NextResponse.json({
      meeting: {
        id: meeting.id,
        uuid: meeting.uuid,
        topic: meeting.topic,
        start_time: meeting.start_time,
        duration: meeting.duration,
        timezone: meeting.timezone,
        join_url: meeting.join_url,
        start_url: meeting.start_url,
        password: meeting.password,
        encrypted_password: meeting.encrypted_password
      }
    });
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
