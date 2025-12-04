import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/teacher/courses/[id]/worksheets/[worksheetId] - Get single worksheet
export async function GET(
  request: Request,
  { params }: { params: { id: string; worksheetId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .select('*')
      .eq('id', params.worksheetId)
      .eq('course_id', params.id)
      .single()

    if (error) throw error

    if (!worksheet) {
      return NextResponse.json({ error: 'Worksheet not found' }, { status: 404 })
    }

    return NextResponse.json(worksheet)
  } catch (error) {
    console.error('Error fetching worksheet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch worksheet' },
      { status: 500 }
    )
  }
}

// PATCH /api/teacher/courses/[id]/worksheets/[worksheetId] - Update worksheet
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; worksheetId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Update worksheet
    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .update({
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        difficulty_level: body.difficulty_level,
        estimated_minutes: body.estimated_minutes,
        worksheet_file_url: body.worksheet_file_url,
        answer_key_url: body.answer_key_url,
        requires_submission: body.requires_submission,
        download_allowed: body.download_allowed,
        print_allowed: body.print_allowed,
        max_grade: body.max_grade,
        display_order: body.display_order,
        tags: body.tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.worksheetId)
      .eq('course_id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(worksheet)
  } catch (error) {
    console.error('Error updating worksheet:', error)
    return NextResponse.json(
      { error: 'Failed to update worksheet' },
      { status: 500 }
    )
  }
}

// DELETE /api/teacher/courses/[id]/worksheets/[worksheetId] - Delete worksheet
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; worksheetId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('worksheets')
      .delete()
      .eq('id', params.worksheetId)
      .eq('course_id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting worksheet:', error)
    return NextResponse.json(
      { error: 'Failed to delete worksheet' },
      { status: 500 }
    )
  }
}
