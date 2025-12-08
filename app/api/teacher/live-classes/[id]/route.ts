import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/teacher/live-classes/[id] - Get class details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const classId = params.id

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get class details with course and teacher info
    const { data: liveClass, error: classError } = await supabase
      .from('live_classes')
      .select(`
        *,
        courses(id, title),
        teachers(id, user_id, users(full_name, email))
      `)
      .eq('id', classId)
      .maybeSingle()

    if (classError) {
      console.error('Database error fetching class:', classError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!liveClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Check authorization
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    const isTeacher = userRole === 'teacher' && liveClass.teachers?.user_id === user.id
    
    // Students can view if enrolled
    let isEnrolled = false
    if (userRole === 'student') {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', liveClass.course_id)
        .eq('user_id', user.id)
        .maybeSingle()
      
      isEnrolled = !!enrollment
    }

    if (!isTeacher && !isEnrolled && userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get enrollment count
    const { count: enrollmentCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', liveClass.course_id)

    // Get attendance count if class is completed
    let attendanceCount = 0
    if (liveClass.status === 'completed') {
      const { count } = await supabase
        .from('class_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId)
        .eq('status', 'present')
      
      attendanceCount = count || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        ...liveClass,
        expectedAttendees: enrollmentCount || 0,
        actualAttendees: attendanceCount,
        courseName: liveClass.courses?.title,
        teacherName: liveClass.teachers?.users?.full_name
      }
    })
  } catch (error) {
    console.error('Get class error:', error)
    return NextResponse.json(
      { error: 'Failed to get class details' },
      { status: 500 }
    )
  }
}

// PATCH /api/teacher/live-classes/[id] - Update class
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const classId = params.id
    const body = await request.json()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing class
    const { data: existingClass, error: fetchError } = await supabase
      .from('live_classes')
      .select('*, teachers(user_id)')
      .eq('id', classId)
      .maybeSingle()

    if (fetchError) {
      console.error('Database error fetching class:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Check authorization
    if (existingClass.teachers?.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const {
      title,
      description,
      date,
      time,
      duration,
      settings
    } = body

    // Update meeting on platform if time/title changed
    if (existingClass.meeting_id && (date || time || title || duration)) {
      const scheduledAt = date && time ? new Date(`${date}T${time}`) : new Date(existingClass.scheduled_at)
      
      if (existingClass.platform === 'zoom') {
        const zoomResponse = await fetch(`${request.nextUrl.origin}/api/zoom/update-meeting/${existingClass.meeting_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            topic: title || existingClass.title,
            start_time: scheduledAt.toISOString(),
            duration: duration || existingClass.duration,
            agenda: description || existingClass.description,
            settings: settings ? {
              mute_upon_entry: settings.muteOnEntry,
              waiting_room: settings.waitingRoom,
              auto_recording: settings.recording ? 'cloud' : 'none'
            } : undefined
          })
        })

        if (!zoomResponse.ok) {
          console.error('Failed to update Zoom meeting')
        }
      }
    }

    // Update database
    const updateData: any = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (date && time) updateData.scheduled_at = new Date(`${date}T${time}`).toISOString()
    if (duration) updateData.duration = duration
    if (settings) updateData.zoom_settings = settings

    const { data: updatedClass, error: updateError } = await supabase
      .from('live_classes')
      .update(updateData)
      .eq('id', classId)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error('Database error updating class:', updateError);
      return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })
    }
    
    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Notify students if rescheduled
    if (date || time) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('user_id')
        .eq('course_id', existingClass.course_id)

      if (enrollments && enrollments.length > 0) {
        const notifications = enrollments.map(enrollment => ({
          user_id: enrollment.user_id,
          type: 'live_class_rescheduled',
          title: 'Live Class Rescheduled',
          message: `${title || existingClass.title} has been rescheduled`,
          data: {
            class_id: classId,
            scheduled_at: updateData.scheduled_at || existingClass.scheduled_at
          },
          created_at: new Date().toISOString()
        }))

        await supabase.from('notifications').insert(notifications)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass
    })
  } catch (error) {
    console.error('Update class error:', error)
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    )
  }
}

// DELETE /api/teacher/live-classes/[id] - Cancel class
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const classId = params.id

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing class
    const { data: existingClass, error: fetchError } = await supabase
      .from('live_classes')
      .select('*, teachers(user_id)')
      .eq('id', classId)
      .maybeSingle()

    if (fetchError) {
      console.error('Database error fetching class:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Check authorization
    if (existingClass.teachers?.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Cancel meeting on platform
    if (existingClass.meeting_id) {
      if (existingClass.platform === 'zoom') {
        const zoomResponse = await fetch(`${request.nextUrl.origin}/api/zoom/delete-meeting/${existingClass.meeting_id}`, {
          method: 'DELETE',
          headers: {
            'Cookie': request.headers.get('cookie') || ''
          }
        })

        if (!zoomResponse.ok) {
          console.error('Failed to delete Zoom meeting')
        }
      } else if (existingClass.platform === 'google-meet' && existingClass.google_event_id) {
        const meetResponse = await fetch(`${request.nextUrl.origin}/api/google-meet/delete-event/${existingClass.google_event_id}`, {
          method: 'DELETE',
          headers: {
            'Cookie': request.headers.get('cookie') || ''
          }
        })

        if (!meetResponse.ok) {
          console.error('Failed to delete Google Meet event')
        }
      }
    }

    // Update status to cancelled instead of deleting
    const { error: updateError } = await supabase
      .from('live_classes')
      .update({ status: 'cancelled' })
      .eq('id', classId)

    if (updateError) {
      throw updateError
    }

    // Notify students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('course_id', existingClass.course_id)

    if (enrollments && enrollments.length > 0) {
      const notifications = enrollments.map(enrollment => ({
        user_id: enrollment.user_id,
        type: 'live_class_cancelled',
        title: 'Live Class Cancelled',
        message: `${existingClass.title} has been cancelled`,
        data: {
          class_id: classId
        },
        created_at: new Date().toISOString()
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({
      success: true,
      message: 'Class cancelled successfully'
    })
  } catch (error) {
    console.error('Delete class error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel class' },
      { status: 500 }
    )
  }
}
