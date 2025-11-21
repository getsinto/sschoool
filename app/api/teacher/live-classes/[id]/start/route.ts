import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/teacher/live-classes/[id]/start - Start class
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const classId = params.id

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get class details
    const { data: liveClass, error: fetchError } = await supabase
      .from('live_classes')
      .select('*, teachers(user_id)')
      .eq('id', classId)
      .single()

    if (fetchError || !liveClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Check authorization
    if (liveClass.teachers?.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update class status to ongoing
    const { error: updateError } = await supabase
      .from('live_classes')
      .update({
        status: 'ongoing',
        actual_start_time: new Date().toISOString()
      })
      .eq('id', classId)

    if (updateError) {
      throw updateError
    }

    // Start recording if enabled
    if (liveClass.zoom_settings?.recording && liveClass.meeting_id && liveClass.platform === 'zoom') {
      try {
        await fetch(`${request.nextUrl.origin}/api/zoom/recording/start/${liveClass.meeting_id}`, {
          method: 'POST',
          headers: {
            'Cookie': request.headers.get('cookie') || ''
          }
        })
      } catch (error) {
        console.error('Failed to start recording:', error)
      }
    }

    // Send notifications to enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('course_id', liveClass.course_id)

    if (enrollments && enrollments.length > 0) {
      const notifications = enrollments.map(enrollment => ({
        user_id: enrollment.user_id,
        type: 'live_class_started',
        title: 'Live Class Started',
        message: `${liveClass.title} has started. Join now!`,
        data: {
          class_id: classId,
          meeting_url: liveClass.meeting_url
        },
        created_at: new Date().toISOString()
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({
      success: true,
      message: 'Class started successfully',
      data: {
        id: classId,
        status: 'ongoing',
        startedAt: new Date().toISOString(),
        meetingUrl: liveClass.join_url || liveClass.meeting_url,
        hostUrl: liveClass.start_url
      }
    })
  } catch (error) {
    console.error('Start class error:', error)
    return NextResponse.json(
      { error: 'Failed to start class' },
      { status: 500 }
    )
  }
}
