import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const courseId = params.id
    const { is_archived, reason } = await request.json()

    if (typeof is_archived !== 'boolean') {
      return NextResponse.json({ error: 'is_archived must be a boolean' }, { status: 400 })
    }

    // Get current course state
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (fetchError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Update course archive status
    const updateData: any = {
      is_archived,
      visibility_changed_at: new Date().toISOString(),
      visibility_changed_by: user.id
    }

    if (is_archived) {
      updateData.archived_at = new Date().toISOString()
      updateData.archived_by = user.id
    } else {
      updateData.archived_at = null
      updateData.archived_by = null
    }

    const { error: updateError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log archive change
    await supabase
      .from('course_visibility_history')
      .insert({
        course_id: courseId,
        action: is_archived ? 'archived' : 'unarchived',
        performed_by: user.id,
        reason,
        previous_state: { is_archived: course.is_archived },
        new_state: { is_archived }
      })

    return NextResponse.json({
      message: `Course ${is_archived ? 'archived' : 'unarchived'} successfully`,
      is_archived
    })
  } catch (error: any) {
    console.error('Error updating course archive status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
