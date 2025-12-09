import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTeacherStudentAccess } from '@/lib/teacher/data-service'

export const dynamic = 'force-dynamic'

// GET /api/teacher/students/[id]/notes - Get student notes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const studentId = params.id

    // Verify teacher has access to this student
    const hasAccess = await verifyTeacherStudentAccess(user.id, studentId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Fetch notes
    const { data: notes, error } = await supabase
      .from('teacher_student_notes')
      .select('*')
      .eq('teacher_id', user.id)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: notes || []
    })
  } catch (error) {
    console.error('Error fetching student notes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student notes' },
      { status: 500 }
    )
  }
}

// POST /api/teacher/students/[id]/notes - Create a student note
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const studentId = params.id
    const body = await request.json()
    const { title, content, category } = body

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title too long (max 200 characters)' },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Content too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // Verify teacher has access to this student
    const hasAccess = await verifyTeacherStudentAccess(user.id, studentId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Create note
    const { data: note, error } = await supabase
      .from('teacher_student_notes')
      .insert({
        teacher_id: user.id,
        student_id: studentId,
        title,
        content,
        category: category || 'general',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: note
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating student note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create student note' },
      { status: 500 }
    )
  }
}

// PATCH /api/teacher/students/[id]/notes - Update a student note
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { noteId, title, content, category } = body

    if (!noteId) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      )
    }

    // Verify note belongs to this teacher
    const { data: existingNote, error: fetchError } = await supabase
      .from('teacher_student_notes')
      .select('*')
      .eq('id', noteId)
      .eq('teacher_id', user.id)
      .single()

    if (fetchError || !existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }

    // Update note
    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (category !== undefined) updates.category = category
    updates.updated_at = new Date().toISOString()

    const { data: note, error } = await supabase
      .from('teacher_student_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: note
    })
  } catch (error) {
    console.error('Error updating student note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update student note' },
      { status: 500 }
    )
  }
}

// DELETE /api/teacher/students/[id]/notes - Delete a student note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      )
    }

    // Verify note belongs to this teacher
    const { data: existingNote, error: fetchError } = await supabase
      .from('teacher_student_notes')
      .select('*')
      .eq('id', noteId)
      .eq('teacher_id', user.id)
      .single()

    if (fetchError || !existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }

    // Delete note
    const { error } = await supabase
      .from('teacher_student_notes')
      .delete()
      .eq('id', noteId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting student note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete student note' },
      { status: 500 }
    )
  }
}
