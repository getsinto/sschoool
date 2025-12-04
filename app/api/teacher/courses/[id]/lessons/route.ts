import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canManageCourseContent } from '@/lib/permissions/coursePermissions';

// GET /api/teacher/courses/[id]/lessons - Get all lessons for a course
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
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');

    // Check if user has content management permission
    const hasPermission = await canManageCourseContent(user.id, courseId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view lessons for this course' },
        { status: 403 }
      );
    }

    // Get lessons from database
    let query = supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data: lessons, error: lessonsError } = await query;

    if (lessonsError) {
      console.error('Get lessons error:', lessonsError);
      return NextResponse.json(
        { error: 'Failed to get lessons' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lessons || []
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    return NextResponse.json(
      { error: 'Failed to get lessons' },
      { status: 500 }
    );
  }
}

// POST /api/teacher/courses/[id]/lessons - Create a new lesson
export async function POST(
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
    const body = await request.json();

    // Validation
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Lesson title is required' },
        { status: 400 }
      );
    }

    // Check if user has content management permission
    const hasPermission = await canManageCourseContent(user.id, courseId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to add lessons to this course' },
        { status: 403 }
      );
    }

    // Create new lesson
    const { data: lesson, error: createError } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        section_id: body.section_id || null,
        title: body.title,
        description: body.description || '',
        content: body.content || '',
        duration: body.duration || 0,
        order_index: body.order_index || 0,
        video_url: body.video_url || null,
        is_preview: body.is_preview || false
      })
      .select()
      .single();

    if (createError) {
      console.error('Create lesson error:', createError);
      return NextResponse.json(
        { error: 'Failed to create lesson' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}

// PUT /api/teacher/courses/[id]/lessons - Bulk update lessons (reorder)
export async function PUT(
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
    const body = await request.json();

    if (!Array.isArray(body.lessons)) {
      return NextResponse.json(
        { error: 'Lessons array is required' },
        { status: 400 }
      );
    }

    // Check if user has content management permission
    const hasPermission = await canManageCourseContent(user.id, courseId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update lessons for this course' },
        { status: 403 }
      );
    }

    // Update order and section for each lesson
    const updates = body.lessons.map((lesson: any, index: number) => 
      supabase
        .from('lessons')
        .update({ 
          order_index: index,
          section_id: lesson.section_id || null
        })
        .eq('id', lesson.id)
        .eq('course_id', courseId)
    );

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'Lessons updated successfully'
    });
  } catch (error) {
    console.error('Update lessons error:', error);
    return NextResponse.json(
      { error: 'Failed to update lessons' },
      { status: 500 }
    );
  }
}
