import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ModuleInsert } from '@/types/lesson'

/**
 * GET /api/courses/[id]/modules
 * Get all modules for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const courseId = params.id

    // Get modules with metadata
    const { data: modules, error } = await supabase
      .from('modules_with_metadata')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) throw error

    return NextResponse.json({ modules }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/modules
 * Create a new module
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const courseId = params.id
    const body = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the next order index
    const { data: existingModules } = await supabase
      .from('modules')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = existingModules && existingModules.length > 0
      ? existingModules[0].order_index + 1
      : 0

    // Prepare module data
    const moduleData: ModuleInsert = {
      course_id: courseId,
      title: body.title,
      description: body.description || null,
      thumbnail_url: body.thumbnail_url || null,
      order_index: nextOrderIndex,
      prerequisites: body.prerequisites || null,
      status: body.status || 'draft',
      access_type: body.access_type || 'enrolled_only'
    }

    // Insert module
    const { data: module, error } = await supabase
      .from('modules')
      .insert(moduleData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ module }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create module' },
      { status: 500 }
    )
  }
}
