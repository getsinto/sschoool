import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createMeeting, listUpcomingMeetings } from '@/lib/google-meet/meetings';
import { hasGoogleIntegration } from '@/lib/google-meet/auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasIntegration = await hasGoogleIntegration(user.id);
    if (!hasIntegration) {
      return NextResponse.json({ error: 'Google Meet not connected' }, { status: 400 });
    }

    const meetings = await listUpcomingMeetings(user.id);
    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Error listing meetings:', error);
    return NextResponse.json(
      { error: 'Failed to list meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasIntegration = await hasGoogleIntegration(user.id);
    if (!hasIntegration) {
      return NextResponse.json({ error: 'Google Meet not connected' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, start_time, end_time, attendees, timezone, live_class_id } = body;

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Google Meet meeting
    const meeting = await createMeeting(user.id, {
      title,
      description,
      start_time,
      end_time,
      attendees,
      timezone,
      sendUpdates: true
    });

    // Update live_classes table with Google Meet info
    if (live_class_id) {
      await supabase
        .from('live_classes')
        .update({
          platform: 'google_meet',
          google_event_id: meeting.eventId,
          join_url: meeting.meetLink,
          platform_data: {
            calendarLink: meeting.calendarLink,
            status: meeting.status
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', live_class_id);
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
