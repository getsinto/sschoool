import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/teacher/courses/[id]/resources/[resourceId] - Get single resource
export async function GET(
  request: Request,
  { params }: { params: { id: string; resourceId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: resource, error } = await supabase
      .from('course_resources')
      .select('*')
      .eq('id', params.resourceId)
      .eq('course_id', params.id)
      .single()

    if (error) throw error

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

// PATCH /api/teacher/courses/[id]/resources/[resourceId] - Update resource
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; resourceId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Update resource
    const { data: resource, error } = await supabase
      .from('course_resources')
      .update({
        title: body.title,
        description: body.description,
        resource_type: body.resource_type,
        resource_category: body.resource_category,
        resource_url: body.resource_url,
        file_url: body.file_url,
        file_type: body.file_type,
        file_size: body.file_size,
        external_platform: body.external_platform,
        thumbnail_url: body.thumbnail_url,
        download_allowed: body.download_allowed,
        requires_enrollment: body.requires_enrollment,
        display_order: body.display_order,
        tags: body.tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.resourceId)
      .eq('course_id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

// DELETE /api/teacher/courses/[id]/resources/[resourceId] - Delete resource
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; resourceId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('course_resources')
      .delete()
      .eq('id', params.resourceId)
      .eq('course_id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
