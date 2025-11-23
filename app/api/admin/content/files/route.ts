import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all files with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const folderId = searchParams.get('folderId')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',')
    const isArchived = searchParams.get('isArchived') === 'true'

    // Build query
    let query = supabase
      .from('content_files')
      .select(`
        *,
        uploaded_by_user:profiles!content_files_uploaded_by_fkey(id, full_name)
      `)
      .eq('is_archived', isArchived)
      .order('created_at', { ascending: false })

    // Apply filters
    if (folderId) {
      query = query.eq('folder_id', folderId)
    }
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }

    const { data: files, error } = await query

    if (error) {
      console.error('Error fetching files:', error)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error in files API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Upload new file
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
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
      original_name,
      type,
      mime_type,
      size,
      url,
      thumbnail_url,
      folder_id,
      folder_path,
      category,
      tags,
      metadata,
      is_public
    } = body

    // Validate required fields
    if (!name || !type || !mime_type || !size || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert file record
    const { data: file, error } = await supabase
      .from('content_files')
      .insert({
        name,
        original_name: original_name || name,
        type,
        mime_type,
        size,
        url,
        thumbnail_url,
        folder_id,
        folder_path: folder_path || '/',
        category: category || 'general',
        tags: tags || [],
        metadata: metadata || {},
        is_public: is_public || false,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating file:', error)
      return NextResponse.json({ error: 'Failed to create file' }, { status: 500 })
    }

    return NextResponse.json({ file }, { status: 201 })
  } catch (error) {
    console.error('Error in files API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
