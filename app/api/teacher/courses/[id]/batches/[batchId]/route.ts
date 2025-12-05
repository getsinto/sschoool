import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; batchId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, batchId } = params

    // Fetch batch
    const { data: batch, error } = await supabase
      .from('course_batches')
      .select('*')
      .eq('id', batchId)
      .eq('course_id', id)
      .single()

    if (error || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    return NextResponse.json(batch)

  } catch (error) {
    console.error('Error fetching batch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; batchId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, batchId } = params
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

    // Update batch
    const { data: batch, error } = await supabase
      .from('course_batches')
      .update({
        batch_name: body.batch_name,
        batch_description: body.batch_description,
        start_date: body.start_date,
        end_date: body.end_date,
        registration_opens: body.registration_opens,
        registration_closes: body.registration_closes,
        schedule_days: body.schedule_days,
        schedule_time: body.schedule_time,
        timezone: body.timezone,
        max_students: body.max_students,
        min_students: body.min_students,
        batch_price: body.batch_price,
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', batchId)
      .eq('course_id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(batch)

  } catch (error) {
    console.error('Error updating batch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; batchId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, batchId } = params

    // Check course ownership
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', id)
      .single()

    if (!course || (course.instructor_id !== user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if batch has enrollments
    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('batch_id', batchId)

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete batch with active enrollments' },
        { status: 400 }
      )
    }

    // Delete batch
    const { error } = await supabase
      .from('course_batches')
      .delete()
      .eq('id', batchId)
      .eq('course_id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Batch deleted successfully' })

  } catch (error) {
    console.error('Error deleting batch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
