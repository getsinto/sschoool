import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'front', 'back', 'resume', etc.
    const documentType = formData.get('documentType') as string // 'id_verification', 'resume', etc.
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !documentType) {
      return NextResponse.json(
        { error: 'Document type and category are required' },
        { status: 400 }
      )
    }

    // Validate file type based on document type
    let allowedTypes: string[] = []
    let maxSize = 0

    if (documentType === 'id_verification') {
      allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      maxSize = 5 * 1024 * 1024 // 5MB
    } else if (documentType === 'resume') {
      allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      maxSize = 10 * 1024 * 1024 // 10MB
    } else {
      allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      maxSize = 5 * 1024 * 1024 // 5MB
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `File size must be less than ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${user.id}-${documentType}-${type}-${timestamp}.${fileExt}`
    
    // Determine storage bucket and path
    let bucket = 'documents'
    let filePath = ''

    switch (documentType) {
      case 'id_verification':
        bucket = 'documents'
        filePath = `id-verification/${fileName}`
        break
      case 'resume':
        bucket = 'documents'
        filePath = `resumes/${fileName}`
        break
      default:
        bucket = 'documents'
        filePath = `misc/${fileName}`
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    // Update relevant profile fields based on document type
    if (documentType === 'id_verification') {
      const updateField = type === 'front' ? 'id_card_url' : 'id_card_back_url'
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          [updateField]: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
      }
    } else if (documentType === 'resume') {
      const { error: updateError } = await supabase
        .from('teachers')
        .update({
          resume_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Teacher profile update error:', updateError)
      }
    }

    // Log document upload
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Document Uploaded',
        message: `${documentType.replace('_', ' ')} document uploaded successfully.`,
        type: 'success',
      })

    return NextResponse.json({
      url: publicUrl,
      type: type,
      documentType: documentType,
      message: 'Document uploaded successfully',
    })
  } catch (error: any) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const documentUrl = searchParams.get('url')
    const documentType = searchParams.get('type')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!documentUrl) {
      return NextResponse.json(
        { error: 'Document URL is required' },
        { status: 400 }
      )
    }

    try {
      // Extract file path from URL
      const url = new URL(documentUrl)
      const pathParts = url.pathname.split('/')
      const bucket = pathParts[pathParts.length - 2] // Get bucket from path
      const fileName = pathParts[pathParts.length - 1]
      const filePath = `${bucket}/${fileName}`

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([filePath])

      if (deleteError) {
        console.error('Storage delete error:', deleteError)
      }

      // Update profile to remove document URL
      if (documentType === 'id_verification') {
        await supabase
          .from('users')
          .update({
            id_card_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      } else if (documentType === 'resume') {
        await supabase
          .from('teachers')
          .update({
            resume_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      }

      return NextResponse.json({
        message: 'Document deleted successfully',
      })
    } catch (urlError) {
      return NextResponse.json(
        { error: 'Invalid document URL' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Document delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}