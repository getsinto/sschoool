import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check course ownership
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', id)
      .single()

    if (!course || (course.instructor_id !== user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch batches
    const { data: batches, error } = await supabase
      .from('course_batches')
      .select('*')
      .eq('course_id', id)
      .order('start_date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(batches || [])

  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Check course ownership
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', id)
      .single()

    if (!course || (course.instructor_id !== user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate required fields
    if (!body.batch_name || !body.start_date || !body.end_date || 
        !body.registration_opens || !body.registration_closes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get next batch number
    const { data: existingBatches } = await supabase
      .from('course_batches')
      .select('batch_number')
      .eq('course_id', id)
      .order('batch_number', { ascending: false })
      .limit(1)

    const nextBatchNumber = existingBatches && existingBatches.length > 0
      ? (existingBatches[0].batch_number || 0) + 1
      : 1

    // Determine status based on dates
    const now = new Date()
    const regOpens = new Date(body.registration_opens)
    const regCloses = new Date(body.registration_closes)
    const startDate = new Date(body.start_date)
    const endDate = new Date(body.end_date)

    let status = 'upcoming'
    if (now >= regOpens && now <= regCloses) {
      status = 'registration_open'
    } else if (now > regCloses && now < startDate) {
      status = 'registration_closed'
    } else if (now >= startDate && now <= endDate) {
      status = 'in_progress'
    } else if (now > endDate) {
      status = 'completed'
    }

    // Create batch
    const { data: batch, error } = await supabase
      .from('course_batches')
      .insert({
        course_id: id,
        batch_name: body.batch_name,
        batch_number: body.batch_number || nextBatchNumber,
        batch_description: body.batch_description,
        start_date: body.start_date,
        end_date: body.end_date,
        registration_opens: body.registration_opens,
        registration_closes: body.registration_closes,
        schedule_days: body.schedule_days || [],
        schedule_time: body.schedule_time,
        timezone: body.timezone || 'UTC',
        max_students: body.max_students,
        min_students: body.min_students,
        batch_price: body.batch_price,
        status,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(batch, { status: 201 })

  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
