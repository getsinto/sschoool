import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteMeeting } from '@/lib/zoom/meetings';

export async function DELETE(
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
    const searchParams = request.nextUrl.searchParams;
    const sendNotification = searchParams.get('notify') === 'true';

    // Delete from Zoom
    await deleteMeeting(meetingId, {
      cancel_meeting_reminder: sendNotification
    });

    // Update database status
    await supabase
      .from('live_classes')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('meeting_id', meetingId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}
