import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (courseError) {
      console.error('Database error fetching course:', courseError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if waitlist is enabled
    if (!course.enable_waitlist) {
      return NextResponse.json(
        { error: 'Waitlist is not enabled for this course' },
        { status: 400 }
      )
    }

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('course_waitlist')
      .select('*')
      .eq('course_id', id)
      .eq('student_id', user.id)
      .eq('status', 'waiting')
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Already on waitlist' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', id)
      .eq('student_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (enrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Get current position in waitlist
    const { count } = await supabase
      .from('course_waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', id)
      .eq('status', 'waiting')

    const position = (count || 0) + 1

    // Add to waitlist
    const { data: waitlistEntry, error } = await supabase
      .from('course_waitlist')
      .insert({
        course_id: id,
        batch_id: body.batch_id,
        student_id: user.id,
        position,
        priority: body.priority || 0,
        notes: body.notes,
        status: 'waiting'
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error('Database error adding to waitlist:', error);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }
    
    if (!waitlistEntry) {
      return NextResponse.json({ error: 'Failed to create waitlist entry' }, { status: 500 })
    }

    // TODO: Send notification email

    return NextResponse.json(waitlistEntry, { status: 201 })

  } catch (error) {
    console.error('Error joining waitlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Remove from waitlist
    const { error } = await supabase
      .from('course_waitlist')
      .delete()
      .eq('course_id', id)
      .eq('student_id', user.id)
      .eq('status', 'waiting')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Removed from waitlist successfully' })

  } catch (error) {
    console.error('Error leaving waitlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get waitlist status
    const { data: waitlistEntry } = await supabase
      .from('course_waitlist')
      .select('*')
      .eq('course_id', id)
      .eq('student_id', user.id)
      .eq('status', 'waiting')
      .maybeSingle()

    if (!waitlistEntry) {
      return NextResponse.json({ on_waitlist: false })
    }

    return NextResponse.json({
      on_waitlist: true,
      position: waitlistEntry.position,
      joined_at: waitlistEntry.joined_waitlist_at
    })

  } catch (error) {
    console.error('Error checking waitlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
