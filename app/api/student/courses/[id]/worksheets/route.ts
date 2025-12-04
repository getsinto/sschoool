import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/student/courses/[id]/worksheets - List all worksheets for a course (student view)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('module_id')

    // Build query - exclude answer keys from student view
    let query = supabase
      .from('worksheets')
      .select(`
        id,
        course_id,
        module_id,
        lesson_id,
        title,
        description,
        instructions,
        difficulty_level,
        estimated_minutes,
        worksheet_file_url,
        worksheet_file_type,
        worksheet_file_size,
        requires_submission,
        download_allowed,
        print_allowed,
        max_grade,
        display_order,
        tags,
        created_at,
        my_submission:worksheet_submissions!worksheet_submissions_worksheet_id_fkey(
          id,
          status,
          grade,
          submitted_at,
          graded_at,
          teacher_feedback
        )
      `)
      .eq('course_id', params.id)
      .eq('worksheet_submissions.student_id', user.id)
      .order('display_order', { ascending: true })

    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }

    const { data: worksheets, error } = await query

    if (error) throw error

    return NextResponse.json(worksheets)
  } catch (error) {
    console.error('Error fetching worksheets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch worksheets' },
      { status: 500 }
    )
  }
}
