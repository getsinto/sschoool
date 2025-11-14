import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { teacherId } = await request.json()

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    // Validate teacher exists and is active
    const { data: teacher, error: teacherError } = await supabase
      .from('users')
      .select('id, full_name, email, role, status')
      .eq('id', teacherId)
      .eq('role', 'teacher')
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found or invalid' },
        { status: 404 }
      )
    }

    if (teacher.status !== 'active') {
      return NextResponse.json(
        { error: 'Teacher account is not active' },
        { status: 400 }
      )
    }

    // Get current course data
    const { data: currentCourse, error: courseError } = await supabase
      .from('courses')
      .select('teacher_id, title')
      .eq('id', params.id)
      .single()

    if (courseError || !currentCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const previousTeacherId = currentCourse.teacher_id

    // Update course teacher
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update({ 
        teacher_id: teacherId,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        teacher:users!courses_teacher_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating course teacher:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign teacher' },
        { status: 500 }
      )
    }

    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'course_teacher_assigned',
        resource_type: 'course',
        resource_id: params.id,
        details: {
          previous_teacher_id: previousTeacherId,
          new_teacher_id: teacherId,
          course_title: currentCourse.title
        }
      })

    // Send notification to new teacher
    await supabase
      .from('notifications')
      .insert({
        user_id: teacherId,
        type: 'course_assigned',
        title: 'New Course Assigned',
        message: `You have been assigned as the teacher for "${currentCourse.title}"`,
        data: {
          course_id: params.id,
          course_title: currentCourse.title,
          assigned_by: user.id
        }
      })

    // If there was a previous teacher, notify them
    if (previousTeacherId && previousTeacherId !== teacherId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: previousTeacherId,
          type: 'course_unassigned',
          title: 'Course Reassigned',
          message: `You have been unassigned from "${currentCourse.title}"`,
          data: {
            course_id: params.id,
            course_title: currentCourse.title,
            reassigned_by: user.id
          }
        })
    }

    // Send email notification to new teacher (optional)
    // This would integrate with your email service
    // await sendEmail({
    //   to: teacher.email,
    //   subject: 'New Course Assignment',
    //   template: 'course-assigned',
    //   data: {
    //     teacherName: teacher.full_name,
    //     courseTitle: currentCourse.title,
    //     courseId: params.id
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Teacher assigned successfully',
      course: updatedCourse,
      teacher: {
        id: teacher.id,
        name: teacher.full_name,
        email: teacher.email
      }
    })

  } catch (error) {
    console.error('Error in assign teacher route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get current teacher assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get course with teacher info
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        teacher_id,
        teacher:users!courses_teacher_id_fkey (
          id,
          full_name,
          email,
          avatar_url,
          status
        )
      `)
      .eq('id', params.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      course_id: course.id,
      course_title: course.title,
      teacher: course.teacher
    })

  } catch (error) {
    console.error('Error in get teacher assignment route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
