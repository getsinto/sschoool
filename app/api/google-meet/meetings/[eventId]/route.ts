import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMeeting, updateMeeting, deleteMeeting } from '@/lib/google-meet/meetings'

export const dynamic = 'force-dynamic'

// Get meeting details
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const meeting = await getMeeting(user.id, params.eventId)

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('Error getting meeting:', error)
    return NextResponse.json({ error: 'Failed to get meeting' }, { status: 500 })
  }
}

// Update meeting
export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
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
      timezone
    } = body

    const meeting = await updateMeeting(user.id, params.eventId, {
      title,
      description,
      start_time,
      end_time,
      attendees,
      timezone
    })

    // Update live class if it exists
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('id')
      .eq('google_event_id', params.eventId)
      .single()

    if (liveClass) {
      await supabase
        .from('live_classes')
        .update({
          join_url: meeting.meetLink,
          platform_data: {
            calendarLink: meeting.calendarLink,
            status: meeting.status
          } as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', liveClass.id)
    }

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('Error updating meeting:', error)
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
  }
}

// Delete meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteMeeting(user.id, params.eventId, true)

    // Clear Google Meet data from live class if it exists
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('id')
      .eq('google_event_id', params.eventId)
      .single()

    if (liveClass) {
      await supabase
        .from('live_classes')
        .update({
          google_event_id: null as any,
          platform_data: null as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', liveClass.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting meeting:', error)
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 })
  }
}
