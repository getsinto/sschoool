import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/teacher/courses/[id]/worksheets/[worksheetId]/submissions
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

    const { data: submissions, error } = await supabase
      .from('worksheet_submissions')
      .select(`
        *,
        student:users!worksheet_submissions_student_id_fkey(id, full_name, email)
      `)
      .eq('worksheet_id', params.worksheetId)
      .order('submitted_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

// POST /api/teacher/courses/[id]/worksheets/[worksheetId]/submissions/[submissionId]/grade
export async function POST(
  request: Request,
  { params }: { params: { id: string; worksheetId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { submissionId, grade, feedback, status } = body

    const { data: submission, error } = await supabase
      .from('worksheet_submissions')
      .update({
        grade,
        teacher_feedback: feedback,
        status: status || 'graded',
        graded_at: new Date().toISOString(),
        graded_by: user.id
      })
      .eq('id', submissionId)
      .eq('worksheet_id', params.worksheetId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error grading submission:', error)
    return NextResponse.json(
      { error: 'Failed to grade submission' },
      { status: 500 }
    )
  }
}
