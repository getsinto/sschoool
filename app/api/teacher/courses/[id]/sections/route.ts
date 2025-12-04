import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canManageCourseContent } from '@/lib/permissions/coursePermissions';

// GET /api/teacher/courses/[id]/sections - Get all sections for a course
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
        { error: 'You do not have permission to view sections for this course' },
        { status: 403 }
      );
    }

    // Get sections from database
    const { data: sections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (sectionsError) {
      console.error('Get sections error:', sectionsError);
      return NextResponse.json(
        { error: 'Failed to get sections' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sections || []
    });
  } catch (error) {
    console.error('Get sections error:', error);
    return NextResponse.json(
      { error: 'Failed to get sections' },
      { status: 500 }
    );
  }
}

// POST /api/teacher/courses/[id]/sections - Create a new section
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
        { error: 'Section title is required' },
        { status: 400 }
      );
    }

    // Check if user has content management permission
    const hasPermission = await canManageCourseContent(user.id, courseId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to add sections to this course' },
        { status: 403 }
      );
    }

    // Create new section
    const { data: section, error: createError } = await supabase
      .from('course_sections')
      .insert({
        course_id: courseId,
        title: body.title,
        description: body.description || '',
        order_index: body.order_index || 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Create section error:', createError);
      return NextResponse.json(
        { error: 'Failed to create section' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      section
    });
  } catch (error) {
    console.error('Create section error:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}

// PUT /api/teacher/courses/[id]/sections - Bulk update sections (reorder)
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

    if (!Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Sections array is required' },
        { status: 400 }
      );
    }

    // Check if user has content management permission
    const hasPermission = await canManageCourseContent(user.id, courseId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update sections for this course' },
        { status: 403 }
      );
    }

    // Update order for each section
    const updates = body.sections.map((section: any, index: number) => 
      supabase
        .from('course_sections')
        .update({ order_index: index })
        .eq('id', section.id)
        .eq('course_id', courseId)
    );

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'Sections updated successfully'
    });
  } catch (error) {
    console.error('Update sections error:', error);
    return NextResponse.json(
      { error: 'Failed to update sections' },
      { status: 500 }
    );
  }
}
