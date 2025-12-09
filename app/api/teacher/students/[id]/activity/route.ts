import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStudentActivity, verifyTeacherStudentAccess } from '@/lib/teacher/data-service'

export const dynamic = 'force-dynamic'

// GET /api/teacher/students/[id]/activity - Get student activity log
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Fetch student activity using data service
    const activity = await getStudentActivity(studentId, courseId, { limit, offset })

    return NextResponse.json({
      success: true,
      data: activity,
      meta: {
        limit,
        offset,
        hasMore: activity.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching student activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student activity' },
      { status: 500 }
    )
  }
}
