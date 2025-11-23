import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch single file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: file, error } = await supabase
      .from('content_files')
      .select(`
        *,
        uploaded_by_user:profiles!content_files_uploaded_by_fkey(id, full_name)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching file:', error)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.json({ file })
  } catch (error) {
    console.error('Error in file API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update file
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or teacher
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      folder_id,
      folder_path,
      category,
      tags,
      metadata,
      is_public,
      is_archived
    } = body

    // Build update object
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (folder_id !== undefined) updates.folder_id = folder_id
    if (folder_path !== undefined) updates.folder_path = folder_path
    if (category !== undefined) updates.category = category
    if (tags !== undefined) updates.tags = tags
    if (metadata !== undefined) updates.metadata = metadata
    if (is_public !== undefined) updates.is_public = is_public
    if (is_archived !== undefined) {
      updates.is_archived = is_archived
      if (is_archived) {
        updates.archived_at = new Date().toISOString()
      }
    }

    const { data: file, error } = await supabase
      .from('content_files')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating file:', error)
      return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
    }

    return NextResponse.json({ file })
  } catch (error) {
    console.error('Error in file API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('content_files')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting file:', error)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in file API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
