import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/teacher/courses/[id]/resources - List all resources for a course
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('module_id')

    // Build query
    let query = supabase
      .from('course_resources')
      .select('*')
      .eq('course_id', params.id)
      .order('display_order', { ascending: true })

    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }

    const { data: resources, error } = await query

    if (error) throw error

    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

// POST /api/teacher/courses/[id]/resources - Create a new resource
export async function POST(
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

    // Validate required fields
    if (!body.title || !body.resource_type) {
      return NextResponse.json(
        { error: 'Title and resource type are required' },
        { status: 400 }
      )
    }

    // Create resource
    const { data: resource, error } = await supabase
      .from('course_resources')
      .insert({
        course_id: params.id,
        module_id: body.module_id,
        resource_type: body.resource_type,
        resource_category: body.resource_category,
        title: body.title,
        description: body.description,
        resource_url: body.resource_url,
        file_url: body.file_url,
        file_type: body.file_type,
        file_size: body.file_size,
        external_platform: body.external_platform,
        thumbnail_url: body.thumbnail_url,
        download_allowed: body.download_allowed ?? true,
        requires_enrollment: body.requires_enrollment ?? true,
        display_order: body.display_order || 0,
        tags: body.tags || [],
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}
