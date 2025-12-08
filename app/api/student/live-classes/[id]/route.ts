import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a student
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const classId = params.id;

    // Get class details
    const { data: liveClass, error } = await supabase
      .from('live_classes')
      .select(`
        *,
        courses!inner(
          id,
          title,
          description,
          thumbnail_url
        )
      `)
      .eq('id', classId)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching class:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    if (!liveClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Verify student is enrolled in the course
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', liveClass.course_id)
      .eq('status', 'active')
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    return NextResponse.json({ class: liveClass });
  } catch (error) {
    console.error('Error fetching live class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live class' },
      { status: 500 }
    );
  }
}
