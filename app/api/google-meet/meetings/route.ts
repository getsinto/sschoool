import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMeeting, listUpcomingMeetings } from '@/lib/google-meet/meetings'

export const dynamic = 'force-dynamic'

// List upcoming meetings
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const meetings = await listUpcomingMeetings(user.id)

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error('Error listing meetings:', error)
    return NextResponse.json({ error: 'Failed to list meetings' }, { status: 500 })
  }
}

// Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      start_time,
      end_time,
      attendees,
      timezone,
      live_class_id
    } = body

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create meeting
    const meeting = await createMeeting(user.id, {
      title,
      description,
      start_time,
      end_time,
      attendees,
      timezone,
      sendUpdates: true
    })

    // If live_class_id provided, update the live class
    if (live_class_id) {
      await supabase
        .from('live_classes')
        .update({
          platform: 'google_meet',
          google_event_id: meeting.eventId,
          join_url: meeting.meetLink,
          platform_data: {
            calendarLink: meeting.calendarLink,
            status: meeting.status
          } as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', live_class_id)
    }

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
  }
}
