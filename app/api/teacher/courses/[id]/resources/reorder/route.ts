import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// PATCH /api/teacher/courses/[id]/resources/reorder - Reorder resources
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
    const { resourceId, direction } = body

    if (!resourceId || !direction) {
      return NextResponse.json(
        { error: 'Resource ID and direction are required' },
        { status: 400 }
      )
    }

    // Get current resource
    const { data: currentResource, error: fetchError } = await supabase
      .from('course_resources')
      .select('display_order, module_id')
      .eq('id', resourceId)
      .eq('course_id', params.id)
      .single()

    if (fetchError) throw fetchError

    const currentOrder = currentResource.display_order
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1

    // Get resource to swap with
    const { data: swapResource, error: swapFetchError } = await supabase
      .from('course_resources')
      .select('id, display_order')
      .eq('course_id', params.id)
      .eq('module_id', currentResource.module_id)
      .eq('display_order', newOrder)
      .single()

    if (swapFetchError || !swapResource) {
      return NextResponse.json(
        { error: 'Cannot move resource in that direction' },
        { status: 400 }
      )
    }

    // Swap display orders
    await supabase
      .from('course_resources')
      .update({ display_order: newOrder })
      .eq('id', resourceId)

    await supabase
      .from('course_resources')
      .update({ display_order: currentOrder })
      .eq('id', swapResource.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering resources:', error)
    return NextResponse.json(
      { error: 'Failed to reorder resources' },
      { status: 500 }
    )
  }
}
