import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const { data: attachments, error: attachmentsError } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', params.id)
      .order('created_at', { ascending: false })

    if (attachmentsError) {
      console.error('Attachments fetch error:', attachmentsError)
      throw attachmentsError
    }

    return NextResponse.json({
      attachments: attachments || [],
      total: attachments?.length || 0
    })
  } catch (error) {
    console.error('Attachments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const messageId = formData.get('message_id') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${params.id}/${Date.now()}.${fileExt}`
    const filePath = `support-attachments/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('File upload error:', uploadError)
      throw uploadError
    }

    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath)

    const { data: attachment, error: attachmentError } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: params.id,
        message_id: messageId || null,
        filename: file.name,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id
      })
      .select('*')
      .single()

    if (attachmentError) {
      console.error('Attachment record error:', attachmentError)
      await supabase.storage.from('attachments').remove([filePath])
      throw attachmentError
    }

    return NextResponse.json({
      attachment,
      message: 'File uploaded successfully',
      success: true
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const attachmentId = searchParams.get('attachment_id')

    if (!attachmentId) {
      return NextResponse.json(
        { error: 'Attachment ID required' },
        { status: 400 }
      )
    }

    const { data: attachment, error: attachmentError } = await supabase
      .from('ticket_attachments')
      .select('*, support_tickets!inner(user_id)')
      .eq('id', attachmentId)
      .eq('ticket_id', params.id)
      .single()

    if (attachmentError || !attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      )
    }

    if (attachment.support_tickets.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await supabase.storage
      .from('attachments')
      .remove([attachment.file_path])

    const { error: deleteError } = await supabase
      .from('ticket_attachments')
      .delete()
      .eq('id', attachmentId)

    if (deleteError) {
      console.error('Attachment delete error:', deleteError)
      throw deleteError
    }

    return NextResponse.json({
      message: 'Attachment deleted successfully',
      success: true
    })
  } catch (error) {
    console.error('Attachment delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    )
  }
}
