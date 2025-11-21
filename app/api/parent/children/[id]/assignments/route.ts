import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const childId = params.id
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the child belongs to this parent
    const { data: child, error: childError } = await supabase
      .from('profiles')
      .select('id, parent_id')
      .eq('id', childId)
      .eq('parent_id', user.id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 })
    }

    // Get child's assignments with submissions and grades
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select(`
        id,
        submitted_at,
        status,
        assignments (
          id,
          title,
          description,
          due_date,
          max_score,
          courses (
            id,
            title
          )
        ),
        grades (
          score,
          feedback
        )
      `)
      .eq('student_id', childId)
      .order('submitted_at', { ascending: false })

    if (submissionsError) {
      console.error('Error fetching assignments:', submissionsError)
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }

    // Format assignments data
    const formattedAssignments = (submissions || []).map((submission: any) => {
      const assignment = submission.assignments
      const grade = submission.grades?.[0]
      
      let status = 'pending'
      if (submission.submitted_at) {
        if (grade) {
          status = 'graded'
        } else {
          status = 'submitted'
        }
      }

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        course: assignment.courses?.title || 'Unknown Course',
        due_date: assignment.due_date,
        max_score: assignment.max_score,
        status,
        grade: grade ? Math.round((grade.score / assignment.max_score) * 100) : null,
        feedback: grade?.feedback,
        submitted_at: submission.submitted_at
      }
    })

    return NextResponse.json(formattedAssignments)
  } catch (error) {
    console.error('Error in parent children assignments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
