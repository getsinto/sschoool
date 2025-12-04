import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { LessonResourceInsert } from '@/types/lesson'

/**
 * GET /api/lessons/[lessonId]/resources
 * Get all resources for a lesson
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const supabase = createClient()
    const { lessonId } = params

    const { data: resources, error } = await supabase
      .from('lesson_resources')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('display_order', { ascending: true })

    if (error) throw error

    return NextResponse.json({ resources }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/lessons/[lessonId]/resources
 * Add a resource to a lesson
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const supabase = createClient()
    const { lessonId } = params
    const body = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the next display order
    const { data: existingResources } = await supabase
      .from('lesson_resources')
      .select('display_order')
      .eq('lesson_id', lessonId)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextDisplayOrder = existingResources && existingResources.length > 0
      ? existingResources[0].display_order + 1
      : 0

    // Prepare resource data
    const resourceData: LessonResourceInsert = {
      lesson_id: lessonId,
      resource_type: body.resource_type,
      resource_name: body.resource_name,
      resource_url: body.resource_url || null,
      resource_description: body.resource_description || null,
      file_size: body.file_size || null,
      can_download: body.can_download ?? true,
      display_order: body.display_order ?? nextDisplayOrder
    }

    // Insert resource
    const { data: resource, error } = await supabase
      .from('lesson_resources')
      .insert(resourceData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ resource }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create resource' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/lessons/[lessonId]/resources
 * Update resource order (bulk update)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const supabase = createClient()
    const { lessonId } = params
    const body = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update each resource's display order
    const updates = body.resources.map((resource: any) =>
      supabase
        .from('lesson_resources')
        .update({ display_order: resource.display_order })
        .eq('id', resource.id)
        .eq('lesson_id', lessonId)
    )

    await Promise.all(updates)

    return NextResponse.json({ message: 'Resources reordered successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error reordering resources:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reorder resources' },
      { status: 500 }
    )
  }
}
