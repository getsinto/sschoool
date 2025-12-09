import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStudentPerformance, verifyTeacherStudentAccess } from '@/lib/teacher/data-service'

export const dynamic = 'force-dynamic'

// GET /api/teacher/students/[id]/performance - Get student performance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const studentId = params.id
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Verify teacher has access to this student
    const hasAccess = await verifyTeacherStudentAccess(user.id, studentId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Fetch student performance using data service
    const performance = await getStudentPerformance(studentId, courseId)

    return NextResponse.json({
      success: true,
      data: performance
    })
  } catch (error) {
    console.error('Error fetching student performance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student performance' },
      { status: 500 }
    )
  }
}
