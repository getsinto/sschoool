import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a parent
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'parent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'upcoming';

    // Get parent's children
    const { data: children } = await supabase
      .from('parent_children')
      .select('child_id, users!inner(full_name)')
      .eq('parent_id', user.id);

    if (!children || children.length === 0) {
      return NextResponse.json({ classes: [] });
    }

    const childIds = children.map(c => c.child_id);

    // Build query based on filter
    let query = supabase
      .from('live_classes')
      .select(`
        id,
        title,
        scheduled_at,
        duration,
        status,
        meeting_id,
        join_url,
        course_id,
        courses!inner(title)
      `)
      .in('course_id', 
        supabase
          .from('enrollments')
          .select('course_id')
          .in('user_id', childIds)
      );

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

    // Enrich with child information
    const enrichedClasses = classes?.map(liveClass => {
      // Find which child is enrolled
      const enrollment = children.find(child => {
        // This is simplified - you'd need to check enrollments table
        return true;
      });

      return {
        ...liveClass,
        course_name: liveClass.courses?.title || 'Unknown Course',
        child_name: enrollment?.users?.full_name || 'Unknown'
      };
    });

    return NextResponse.json({ classes: enrichedClasses || [] });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live classes' },
      { status: 500 }
    );
  }
}
