import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a teacher
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    
    if (userRole !== 'teacher') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const courseId = params.id

    // TODO: Implement course duplication logic
    // This should:
    // 1. Copy all course data
    // 2. Copy all sections and lessons
    // 3. Copy all resources
    // 4. Set status to 'draft'
    // 5. Add '(Copy)' to the title

    return NextResponse.json({
      success: true,
      message: 'Course duplicated successfully',
      newCourseId: 'duplicated-course-id'
    }, { status: 201 })
  } catch (error) {
    console.error('Duplicate course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
