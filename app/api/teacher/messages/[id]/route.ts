import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/teacher/messages/[id] - Get a specific message
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

    const messageId = params.id

    // Fetch message
    const { data: message, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, first_name, last_name, email, avatar_url),
        recipient:recipient_id(id, first_name, last_name, email, avatar_url)
      `)
      .eq('id', messageId)
      .single()

    if (error) {
      throw error
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    // Verify user has access to this message
    if (message.sender_id !== user.id && message.recipient_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Mark as read if user is recipient
    if (message.recipient_id === user.id && !message.read) {
      await supabase
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
      
      message.read = true
      message.read_at = new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Error fetching message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch message' },
      { status: 500 }
    )
  }
}

// PATCH /api/teacher/messages/[id] - Update message (mark as read/unread)
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

    const messageId = params.id
    const body = await request.json()
    const { read } = body

    // Verify message exists and user is recipient
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.recipient_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update message
    const updates: any = { read }
    if (read) {
      updates.read_at = new Date().toISOString()
    } else {
      updates.read_at = null
    }

    const { data: updated, error: updateError } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

// DELETE /api/teacher/messages/[id] - Delete a message
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

    const messageId = params.id

    // Verify message exists and user has access
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.sender_id !== user.id && message.recipient_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Soft delete by marking as deleted for this user
    const deleteField = message.sender_id === user.id ? 'deleted_by_sender' : 'deleted_by_recipient'
    
    const { error: deleteError } = await supabase
      .from('messages')
      .update({ [deleteField]: true })
      .eq('id', messageId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
