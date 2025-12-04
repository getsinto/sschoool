import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/teacher/courses/[id]/worksheets - List all worksheets for a course
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

    // Build query
    let query = supabase
      .from('worksheets')
      .select(`
        *,
        submission_count:worksheet_submissions(count),
        graded_count:worksheet_submissions(count).eq(status, 'graded'),
        average_grade:worksheet_submissions(grade).avg()
      `)
      .eq('course_id', params.id)
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

// POST /api/teacher/courses/[id]/worksheets - Create a new worksheet
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.worksheet_file_url) {
      return NextResponse.json(
        { error: 'Title and worksheet file are required' },
        { status: 400 }
      )
    }

    // Create worksheet
    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .insert({
        course_id: params.id,
        module_id: body.module_id,
        lesson_id: body.lesson_id,
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        difficulty_level: body.difficulty_level,
        estimated_minutes: body.estimated_minutes,
        worksheet_file_url: body.worksheet_file_url,
        worksheet_file_type: body.worksheet_file_type,
        worksheet_file_size: body.worksheet_file_size,
        answer_key_url: body.answer_key_url,
        answer_key_file_type: body.answer_key_file_type,
        requires_submission: body.requires_submission ?? false,
        download_allowed: body.download_allowed ?? true,
        print_allowed: body.print_allowed ?? true,
        max_grade: body.max_grade || 100,
        display_order: body.display_order || 0,
        tags: body.tags || [],
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(worksheet, { status: 201 })
  } catch (error) {
    console.error('Error creating worksheet:', error)
    return NextResponse.json(
      { error: 'Failed to create worksheet' },
      { status: 500 }
    )
  }
}
