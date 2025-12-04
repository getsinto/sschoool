import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const courseId = params.id

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check role_level
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, role_level')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user is admin (role_level >= 4)
    if (profile.role_level < 4) {
      return NextResponse.json(
        { error: 'Only administrators can unpublish courses' },
        { status: 403 }
      )
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, status')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Update course status to draft
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to unpublish course', details: updateError.message },
        { status: 500 }
      )
    }

    // Get enrolled students for notifications
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id, students:users!enrollments_student_id_fkey(id, email, full_name)')
      .eq('course_id', courseId)

    // Send notifications to enrolled students
    if (enrollments && enrollments.length > 0) {
      const notifications = enrollments.map(enrollment => ({
        user_id: enrollment.student_id,
        type: 'course_unpublished',
        title: 'Course Unpublished',
        message: `The course "${course.title}" has been unpublished and is temporarily unavailable.`,
        related_id: courseId,
        related_type: 'course',
        created_at: new Date().toISOString()
      }))

      await supabase
        .from('notifications')
        .insert(notifications)
    }

    return NextResponse.json({
      success: true,
      message: 'Course unpublished successfully',
      course: updatedCourse,
      notified_students: enrollments?.length || 0
    })

  } catch (error) {
    console.error('Error unpublishing course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
