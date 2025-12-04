import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canManageCourseContent } from '@/lib/permissions/coursePermissions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;

    // Check if user has content management permission
    const hasPermission = await canManageCourseContent(user.id, courseId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to access this course content' },
        { status: 403 }
      );
    }

    // Fetch course with assignment details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        course_assignments!inner(
          can_manage_content,
          can_grade,
          can_communicate,
          is_primary_teacher
        )
      `)
      .eq('id', courseId)
      .eq('course_assignments.teacher_id', user.id)
      .single();

    if (courseError) {
      console.error('Error fetching course:', courseError);
      return NextResponse.json(
        { error: 'Failed to fetch course' },
        { status: 500 }
      );
    }

    // Fetch sections
    const { data: sections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
    }

    // Fetch lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
    }

    // Fetch materials
    const { data: materials, error: materialsError } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (materialsError) {
      console.error('Error fetching materials:', materialsError);
    }

    return NextResponse.json({
      content: {
        course,
        sections: sections || [],
        lessons: lessons || [],
        materials: materials || []
      }
    });
  } catch (error) {
    console.error('Error in GET /api/teacher/courses/[id]/content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;

    // Check if user has content management permission
    const hasPermission = await canManageCourseContent(user.id, courseId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this course content' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Define allowed content fields (teachers can only update these)
    const allowedFields = [
      'description',
      'learning_objectives',
      'prerequisites',
      'curriculum',
      'materials',
      'resources'
    ];

    // Filter to only allowed fields
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update course content
    const { data: course, error: updateError } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating course content:', updateError);
      return NextResponse.json(
        { error: 'Failed to update course content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error in PATCH /api/teacher/courses/[id]/content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
