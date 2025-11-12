import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a student
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'upcoming';

    // Get student's enrolled courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ classes: [] });
    }

    const courseIds = enrollments.map(e => e.course_id);

    // Build query based on filter
    let query = supabase
      .from('live_classes')
      .select(`
        id,
        title,
        description,
        scheduled_at,
        duration,
        status,
        meeting_id,
        join_url,
        password,
        course_id,
        courses!inner(title, thumbnail_url)
      `)
      .in('course_id', courseIds);

    const now = new Date().toISOString();

    if (filter === 'upcoming') {
      query = query
        .gte('scheduled_at', now)
        .in('status', ['scheduled', 'live'])
        .order('scheduled_at', { ascending: true });
    } else if (filter === 'past') {
      query = query
        .lt('scheduled_at', now)
        .eq('status', 'ended')
        .order('scheduled_at', { ascending: false });
    } else {
      query = query.order('scheduled_at', { ascending: false });
    }

    const { data: classes, error } = await query.limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ classes: classes || [] });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live classes' },
      { status: 500 }
    );
  }
}
