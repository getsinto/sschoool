import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase: any = await createClient()
    const { id } = params
    const { status } = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user details to check role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, role_level')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to publish courses (admin only)
    if (userData.role !== 'admin' || (userData.role_level || 0) < 4) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Only administrators can publish or unpublish courses',
          code: 'INSUFFICIENT_PERMISSIONS',
          required_role: 'admin',
          required_level: 4,
          user_role: userData.role,
          user_level: userData.role_level
        },
        { status: 403 }
      )
    }

    // Validate status
    if (!['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be draft, published, or archived' },
        { status: 400 }
      )
    }

    // Get current course status
    const { data: currentCourse, error: courseError } = await supabase
      .from('courses')
      .select('status, title, enrollments')
      .eq('id', id)
      .single()

    if (courseError || !currentCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Update course status
    const updateData = { 
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }
    
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating course status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update course status' },
        { status: 500 }
      )
    }

    // If publishing, send notifications to enrolled students
    if (status === 'published' && currentCourse.status !== 'published') {
      try {
        // Get enrolled students
        const { data: enrollments, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('user_id, users(email, full_name)')
          .eq('course_id', id)

        if (!enrollmentError && enrollments && enrollments.length > 0) {
          // Create notifications for enrolled students
          const notifications = enrollments.map((enrollment: any) => ({
            user_id: enrollment.user_id,
            type: 'course_published',
            title: 'Course Published',
            message: `The course "${currentCourse.title}" has been published and is now available!`,
            data: {
              course_id: id,
              course_title: currentCourse.title
            },
            created_at: new Date().toISOString()
          }))

          // Insert notifications
          await supabase
            .from('notifications')
            .insert(notifications)

          // TODO: Send email notifications
          // This would integrate with the email notification system
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError)
        // Don't fail the request if notifications fail
      }
    }

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      message: `Course ${status === 'published' ? 'published' : status === 'draft' ? 'unpublished' : 'archived'} successfully`,
      notifications_sent: status === 'published' && currentCourse.status !== 'published'
    })

  } catch (error) {
    console.error('Error in course status update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check current status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase: any = await createClient()
    const { id } = params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get course status
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, status, published_at, updated_at')
      .eq('id', id)
      .single() as any

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      course_id: course.id,
      status: course.status,
      published_at: course.published_at,
      updated_at: course.updated_at
    })

  } catch (error) {
    console.error('Error fetching course status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
