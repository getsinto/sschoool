import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateMeeting } from '@/lib/zoom/meetings';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is teacher or admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['teacher', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const meetingId = params.id;
    const body = await request.json();

    // Update Zoom meeting
    await updateMeeting(meetingId, body);

    // Update database record if needed
    if (body.topic || body.start_time || body.duration) {
      const updateData: any = {};
      if (body.topic) updateData.title = body.topic;
      if (body.start_time) updateData.scheduled_at = body.start_time;
      if (body.duration) updateData.duration = body.duration;
      if (body.password) updateData.password = body.password;

      await supabase
        .from('live_classes')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('meeting_id', meetingId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}
