import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startRecording } from '@/lib/zoom/recordings';

export async function POST(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is teacher or admin (host)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['teacher', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const meetingId = params.meetingId;

    // Start recording via Zoom API
    await startRecording(meetingId);

    // Update database to track recording status
    await supabase
      .from('live_classes')
      .update({ 
        recording_status: 'recording',
        updated_at: new Date().toISOString()
      })
      .eq('meeting_id', meetingId);

    return NextResponse.json({ success: true, status: 'recording' });
  } catch (error) {
    console.error('Error starting recording:', error);
    return NextResponse.json(
      { error: 'Failed to start recording' },
      { status: 500 }
    );
  }
}
