import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteFile } from '@/lib/uploads/file-handler'

/**
 * DELETE /api/upload/file/[id]
 * Delete a file from storage and database
 * 
 * Validates: Requirements 3.10, 3.11
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const fileId = params.id

    // Get file record from database
    const { data: fileRecord, error: fetchError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Permission validation: Only file owner or admin can delete
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = fileRecord.uploaded_by === user.id
    const isAdmin = profile?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete this file' },
        { status: 403 }
      )
    }

    // Delete file from storage
    const storagePath = fileRecord.storage_path
    const bucket = fileRecord.bucket || 'uploads'

    const { error: storageError } = await supabase
      .storage
      .from(bucket)
      .remove([storagePath])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database cleanup even if storage deletion fails
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('file_uploads')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to delete file record from database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
