import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { canDeleteCourse } from '@/lib/permissions/coursePermissions'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user details with role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, role_level, full_name')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to delete courses
    if (!canDeleteCourse(userData)) {
      return NextResponse.json(
        { 
          error: 'Forbidden: Only administrators can delete courses',
          message: 'You do not have permission to delete courses. Please contact an administrator.'
        },
        { status: 403 }
      )
    }

    const courseId = params.id

    // Get course details before deletion
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

    // Get all assigned teachers to notify them
    const { data: assignments, error: assignmentsError } = await supabase
      .from('course_assignments')
      .select(`
        teacher_id,
        is_primary_teacher,
        users:teacher_id (
          id,
          email,
          full_name
        )
      `)
      .eq('course_id', courseId)

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
    }

    // Delete the course (cascade will handle assignments)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (deleteError) {
      console.error('Error deleting course:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete course', details: deleteError.message },
        { status: 500 }
      )
    }

    // Create notifications for assigned teachers
    if (assignments && assignments.length > 0) {
      const notifications = assignments.map((assignment: any) => ({
        user_id: assignment.teacher_id,
        type: 'course_deleted',
        title: 'Course Deleted',
        message: `The course "${course.title}" has been deleted by an administrator.`,
        related_type: 'course',
        related_id: courseId,
        created_at: new Date().toISOString()
      }))

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notificationError) {
        console.error('Error creating notifications:', notificationError)
        // Don't fail the deletion if notifications fail
      }

      // TODO: Send email notifications to teachers
      // This would integrate with the email system
      try {
        // Send emails to all assigned teachers
        for (const assignment of assignments) {
          if (assignment.users) {
            // Email sending logic would go here
            console.log(`Would send deletion email to ${assignment.users.email}`)
          }
        }
      } catch (emailError) {
        console.error('Error sending emails:', emailError)
        // Don't fail the deletion if emails fail
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
      course: {
        id: course.id,
        title: course.title
      },
      notified_teachers: assignments?.length || 0
    })

  } catch (error) {
    console.error('Error in course deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
