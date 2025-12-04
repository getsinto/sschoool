import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/student/courses/[id]/worksheets/[worksheetId] - Get single worksheet (student view)
export async function GET(
  request: Request,
  { params }: { params: { id: string; worksheetId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get worksheet (exclude answer key)
    const { data: worksheet, error: worksheetError } = await supabase
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
        created_at
      `)
      .eq('id', params.worksheetId)
      .eq('course_id', params.id)
      .single()

    if (worksheetError) throw worksheetError

    if (!worksheet) {
      return NextResponse.json({ error: 'Worksheet not found' }, { status: 404 })
    }

    // Get student's submission if exists
    const { data: submission } = await supabase
      .from('worksheet_submissions')
      .select('*')
      .eq('worksheet_id', params.worksheetId)
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      ...worksheet,
      my_submission: submission || null
    })
  } catch (error) {
    console.error('Error fetching worksheet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch worksheet' },
      { status: 500 }
    )
  }
}
