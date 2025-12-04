import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canManageCourseContent } from '@/lib/permissions/coursePermissions';

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

    // Check if user has content management permission
    const hasPermission = await canManageCourseContent(user.id, courseId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to add materials to this course' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      file_url,
      file_type,
      file_size,
      is_downloadable = true,
      is_required = false
    } = body;

    // Validate required fields
    if (!title || !file_url) {
      return NextResponse.json(
        { error: 'Title and file URL are required' },
        { status: 400 }
      );
    }

    // Create material
    const { data: material, error: createError } = await supabase
      .from('course_materials')
      .insert({
        course_id: courseId,
        title,
        description,
        file_url,
        file_type,
        file_size,
        is_downloadable,
        is_required,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating material:', createError);
      return NextResponse.json(
        { error: 'Failed to create material' },
        { status: 500 }
      );
    }

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/teacher/courses/[id]/materials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
