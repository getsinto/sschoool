import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// POST /api/student/courses/[id]/worksheets/[worksheetId]/submit - Submit worksheet
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
    const { submission_file_url, submission_file_type, submission_file_size, student_notes } = body

    if (!submission_file_url) {
      return NextResponse.json(
        { error: 'Submission file is required' },
        { status: 400 }
      )
    }

    // Check if worksheet exists and requires submission
    const { data: worksheet, error: worksheetError } = await supabase
      .from('worksheets')
      .select('requires_submission, max_grade')
      .eq('id', params.worksheetId)
      .eq('course_id', params.id)
      .single()

    if (worksheetError) throw worksheetError

    if (!worksheet) {
      return NextResponse.json({ error: 'Worksheet not found' }, { status: 404 })
    }

    if (!worksheet.requires_submission) {
      return NextResponse.json(
        { error: 'This worksheet does not require submission' },
        { status: 400 }
      )
    }

    // Check if student already has a pending or graded submission
    const { data: existingSubmission } = await supabase
      .from('worksheet_submissions')
      .select('id, status')
      .eq('worksheet_id', params.worksheetId)
      .eq('student_id', user.id)
      .in('status', ['pending', 'graded'])
      .single()

    if (existingSubmission && existingSubmission.status === 'graded') {
      return NextResponse.json(
        { error: 'You have already submitted and been graded for this worksheet' },
        { status: 400 }
      )
    }

    // Create or update submission
    const submissionData = {
      worksheet_id: params.worksheetId,
      student_id: user.id,
      submission_file_url,
      submission_file_type,
      submission_file_size,
      student_notes,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }

    let submission
    if (existingSubmission) {
      // Update existing submission
      const { data, error } = await supabase
        .from('worksheet_submissions')
        .update(submissionData)
        .eq('id', existingSubmission.id)
        .select()
        .single()

      if (error) throw error
      submission = data
    } else {
      // Create new submission
      const { data, error } = await supabase
        .from('worksheet_submissions')
        .insert(submissionData)
        .select()
        .single()

      if (error) throw error
      submission = data
    }

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error submitting worksheet:', error)
    return NextResponse.json(
      { error: 'Failed to submit worksheet' },
      { status: 500 }
    )
  }
}
