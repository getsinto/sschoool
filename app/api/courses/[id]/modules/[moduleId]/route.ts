import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ModuleUpdate } from '@/types/lesson'

/**
 * GET /api/courses/[id]/modules/[moduleId]
 * Get a single module with its lessons
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const supabase = createClient()
    const { moduleId } = params

    // Get module with metadata
    const { data: module, error: moduleError } = await supabase
      .from('modules_with_metadata')
      .select('*')
      .eq('id', moduleId)
      .single()

    if (moduleError) throw moduleError

    // Get lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true })

    if (lessonsError) throw lessonsError

    return NextResponse.json({ module: { ...module, lessons } }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching module:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch module' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/courses/[id]/modules/[moduleId]
 * Update a module
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const supabase = createClient()
    const { moduleId } = params
    const body = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare update data
    const updateData: ModuleUpdate = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url
    if (body.order_index !== undefined) updateData.order_index = body.order_index
    if (body.prerequisites !== undefined) updateData.prerequisites = body.prerequisites
    if (body.status !== undefined) updateData.status = body.status
    if (body.access_type !== undefined) updateData.access_type = body.access_type

    // Update module
    const { data: module, error } = await supabase
      .from('modules')
      .update(updateData)
      .eq('id', moduleId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ module }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating module:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update module' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]/modules/[moduleId]
 * Delete a module (and all its lessons)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const supabase = createClient()
    const { moduleId } = params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete module (cascade will delete lessons)
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId)

    if (error) throw error

    return NextResponse.json({ message: 'Module deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete module' },
      { status: 500 }
    )
  }
}
