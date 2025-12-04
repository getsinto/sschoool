import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { LessonResourceUpdate } from '@/types/lesson'

/**
 * PUT /api/lessons/[lessonId]/resources/[resourceId]
 * Update a specific resource
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { lessonId: string; resourceId: string } }
) {
  try {
    const supabase = createClient()
    const { lessonId, resourceId } = params
    const body = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare update data
    const updateData: LessonResourceUpdate = {}
    if (body.resource_type !== undefined) updateData.resource_type = body.resource_type
    if (body.resource_name !== undefined) updateData.resource_name = body.resource_name
    if (body.resource_url !== undefined) updateData.resource_url = body.resource_url
    if (body.resource_description !== undefined) updateData.resource_description = body.resource_description
    if (body.file_size !== undefined) updateData.file_size = body.file_size
    if (body.can_download !== undefined) updateData.can_download = body.can_download
    if (body.display_order !== undefined) updateData.display_order = body.display_order

    // Update resource
    const { data: resource, error } = await supabase
      .from('lesson_resources')
      .update(updateData)
      .eq('id', resourceId)
      .eq('lesson_id', lessonId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ resource }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update resource' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/lessons/[lessonId]/resources/[resourceId]
 * Delete a specific resource
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { lessonId: string; resourceId: string } }
) {
  try {
    const supabase = createClient()
    const { lessonId, resourceId } = params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete resource
    const { error } = await supabase
      .from('lesson_resources')
      .delete()
      .eq('id', resourceId)
      .eq('lesson_id', lessonId)

    if (error) throw error

    return NextResponse.json({ message: 'Resource deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
