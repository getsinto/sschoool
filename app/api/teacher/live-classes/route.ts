import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const body = await request.json()

    // TODO: Implement class creation logic
    // This should:
    // 1. Create class record in database
    // 2. Generate meeting link (Zoom/Google Meet API)
    // 3. Send notifications to enrolled students
    // 4. Add to calendar

    return NextResponse.json({
      success: true,
      message: 'Live class scheduled successfully',
      classId: 'new-class-id'
    }, { status: 201 })
  } catch (error) {
    console.error('Create live class error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
