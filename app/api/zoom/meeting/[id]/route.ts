import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMeeting } from '@/lib/zoom/meetings';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingId = params.id;

    // Get meeting from Zoom
    const meeting = await getMeeting(meetingId);

    // Get additional data from database
    const { data: classData } = await supabase
      .from('live_classes')
      .select('*')
      .eq('meeting_id', meetingId)
      .single();

    return NextResponse.json({
      ...meeting,
      classData
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}
