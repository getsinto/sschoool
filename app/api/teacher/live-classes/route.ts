import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // upcoming, past, all

    // TODO: Replace with actual database query
    const mockClasses = [
      {
        id: '1',
        title: 'Advanced Mathematics - Calculus',
        course: 'Grade 10 Mathematics',
        courseId: 'course-1',
        dateTime: '2024-01-20T10:00:00',
        duration: 60,
        platform: 'Zoom',
        expectedAttendees: 25,
        actualAttendees: 23,
        status: 'upcoming',
        meetingLink: 'https://zoom.us/j/123456789',
        meetingPassword: 'abc123',
        canJoin: false
      },
      {
        id: '2',
        title: 'Physics Lab Discussion',
        course: 'Grade 9 Physics',
        courseId: 'course-2',
        dateTime: '2024-01-20T14:30:00',
        duration: 90,
        platform: 'Google Meet',
        expectedAttendees: 18,
        actualAttendees: 18,
        status: 'ongoing',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        canJoin: true
      },
      {
        id: '3',
        title: 'English Literature Review',
        course: 'Grade 8 English',
        courseId: 'course-3',
        dateTime: '2024-01-18T16:00:00',
        duration: 45,
        platform: 'Zoom',
        expectedAttendees: 22,
        actualAttendees: 20,
        status: 'completed',
        hasRecording: true,
        recordingUrl: 'https://example.com/recording.mp4',
        meetingLink: 'https://zoom.us/j/987654321'
      }
    ]

    // Filter by status if provided
    let filteredClasses = mockClasses
    if (status && status !== 'all') {
      if (status === 'upcoming') {
        filteredClasses = mockClasses.filter(cls => cls.status === 'upcoming' || cls.status === 'ongoing')
      } else if (status === 'past') {
        filteredClasses = mockClasses.filter(cls => cls.status === 'completed' || cls.status === 'cancelled')
      }
    }

    return NextResponse.json({
      classes: filteredClasses,
      total: filteredClasses.length
    })
  } catch (error) {
    console.error('Get live classes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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

    const body = await request.json()
    const {
      title,
      courseId,
      date,
      time,
      duration,
      platform,
      description,
      isRecurring,
      recurringFrequency,
      recurringDays,
      recurringEndDate,
      recurringOccurrences,
      settings
    } = body

    // Get teacher ID
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Combine date and time
    const scheduledAt = new Date(`${date}T${time}`)
    
    let meetingData: any = null
    let meetingUrl = ''
    let startUrl = ''
    let meetingId = ''
    let password = ''

    // Create meeting based on platform
    if (platform === 'zoom') {
      // Create Zoom meeting
      const zoomResponse = await fetch(`${request.nextUrl.origin}/api/zoom/create-meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          topic: title,
          start_time: scheduledAt.toISOString(),
          duration: duration || 60,
          timezone: 'UTC',
          agenda: description,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: settings?.muteOnEntry ?? true,
            waiting_room: settings?.waitingRoom ?? true,
            auto_recording: settings?.recording ? 'cloud' : 'none',
            allow_multiple_devices: true
          },
          recurrence: isRecurring ? {
            type: recurringFrequency === 'daily' ? 1 : recurringFrequency === 'weekly' ? 2 : 3,
            repeat_interval: 1,
            weekly_days: recurringDays?.join(','),
            end_times: recurringOccurrences
          } : undefined
        })
      })

      if (!zoomResponse.ok) {
        throw new Error('Failed to create Zoom meeting')
      }

      const zoomData = await zoomResponse.json()
      meetingData = zoomData.meeting
      meetingUrl = meetingData.join_url
      startUrl = meetingData.start_url
      meetingId = meetingData.id.toString()
      password = meetingData.password
    } else if (platform === 'google-meet') {
      // Create Google Meet meeting
      const meetResponse = await fetch(`${request.nextUrl.origin}/api/google-meet/create-meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          summary: title,
          description: description,
          start: scheduledAt.toISOString(),
          end: new Date(scheduledAt.getTime() + (duration || 60) * 60000).toISOString(),
          attendees: [] // Will be populated from enrollments
        })
      })

      if (!meetResponse.ok) {
        throw new Error('Failed to create Google Meet meeting')
      }

      const meetData = await meetResponse.json()
      meetingData = meetData.event
      meetingUrl = meetData.meetLink
      meetingId = meetData.eventId
    }

    // Create live class record
    const { data: liveClass, error: classError } = await supabase
      .from('live_classes')
      .insert({
        course_id: courseId,
        teacher_id: teacher.id,
        title: title,
        description: description,
        scheduled_at: scheduledAt.toISOString(),
        duration: duration || 60,
        platform: platform,
        meeting_url: meetingUrl,
        meeting_id: meetingId,
        join_url: meetingUrl,
        start_url: startUrl,
        password: password,
        status: 'scheduled',
        zoom_settings: platform === 'zoom' ? settings : null,
        google_event_id: platform === 'google-meet' ? meetingId : null
      })
      .select()
      .single()

    if (classError) {
      throw classError
    }

    // Get enrolled students for notifications
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id, users(email, full_name)')
      .eq('course_id', courseId)

    // Send notifications to enrolled students
    if (enrollments && enrollments.length > 0) {
      const notifications = enrollments.map(enrollment => ({
        user_id: enrollment.user_id,
        type: 'live_class_scheduled',
        title: 'New Live Class Scheduled',
        message: `${title} has been scheduled for ${scheduledAt.toLocaleString()}`,
        data: {
          class_id: liveClass.id,
          meeting_url: meetingUrl,
          scheduled_at: scheduledAt.toISOString()
        },
        created_at: new Date().toISOString()
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({
      success: true,
      message: 'Live class scheduled successfully',
      data: liveClass
    }, { status: 201 })
  } catch (error) {
    console.error('Create live class error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
