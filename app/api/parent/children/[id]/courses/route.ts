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

    // Get child's course enrollments with progress
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        progress,
        status,
        enrolled_at,
        completed_at,
        courses (
          id,
          title,
          description,
          thumbnail_url
        )
      `)
      .eq('student_id', childId)

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    // Get grades for each course
    const coursesWithGrades = await Promise.all(
      (enrollments || []).map(async (enrollment: any) => {
        const { data: grades } = await supabase
          .from('grades')
          .select('score')
          .eq('student_id', childId)
          .eq('course_id', enrollment.courses.id)

        const averageGrade = grades && grades.length > 0
          ? Math.round(grades.reduce((sum: number, grade: any) => sum + grade.score, 0) / grades.length)
          : null

        return {
          id: enrollment.courses.id,
          title: enrollment.courses.title,
          description: enrollment.courses.description,
          thumbnail_url: enrollment.courses.thumbnail_url,
          progress: enrollment.progress || 0,
          status: enrollment.status || 'active',
          grade: averageGrade ? `${averageGrade}%` : null,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at
        }
      })
    )

    return NextResponse.json(coursesWithGrades)
  } catch (error) {
    console.error('Error in parent children courses API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
