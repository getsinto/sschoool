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

    // Check if user is admin or course owner
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const courseId = params.id
    const { is_visible, reason } = await request.json()

    if (typeof is_visible !== 'boolean') {
      return NextResponse.json({ error: 'is_visible must be a boolean' }, { status: 400 })
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

    // Check permissions
    if (profile?.role !== 'admin' && course.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update course visibility
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        is_visible,
        visibility_changed_at: new Date().toISOString(),
        visibility_changed_by: user.id
      })
      .eq('id', courseId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log visibility change
    await supabase
      .from('course_visibility_history')
      .insert({
        course_id: courseId,
        action: is_visible ? 'visible' : 'hidden',
        performed_by: user.id,
        reason,
        previous_state: { is_visible: course.is_visible },
        new_state: { is_visible }
      })

    return NextResponse.json({
      message: `Course ${is_visible ? 'shown' : 'hidden'} successfully`,
      is_visible
    })
  } catch (error: any) {
    console.error('Error updating course visibility:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
