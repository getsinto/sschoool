import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// PATCH /api/teacher/courses/[id]/resources/bulk-update - Bulk update resources
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resourceIds, updates } = body

    if (!resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
      return NextResponse.json(
        { error: 'Resource IDs array is required' },
        { status: 400 }
      )
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates object is required' },
        { status: 400 }
      )
    }

    // Update all selected resources
    const { data: resources, error } = await supabase
      .from('course_resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('course_id', params.id)
      .in('id', resourceIds)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      updated: resources.length,
      resources
    })
  } catch (error) {
    console.error('Error bulk updating resources:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update resources' },
      { status: 500 }
    )
  }
}
