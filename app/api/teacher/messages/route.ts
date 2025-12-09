import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '@/lib/teacher/data-service'

export const dynamic = 'force-dynamic'

// GET /api/teacher/messages - Get teacher messages
export async function GET(request: NextRequest) {
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
    const type = searchParams.get('type') || 'all' // 'sent', 'received', 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query based on type
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, first_name, last_name, email, avatar_url),
        recipient:recipient_id(id, first_name, last_name, email, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type === 'sent') {
      query = query.eq('sender_id', user.id)
    } else if (type === 'received') {
      query = query.eq('recipient_id', user.id)
    } else {
      query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    }

    const { data: messages, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: messages || [],
      meta: {
        limit,
        offset,
        hasMore: messages && messages.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/teacher/messages - Send a message
export async function POST(request: NextRequest) {
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
    const { recipientId, subject, content } = body

    // Validate input
    if (!recipientId || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Subject too long (max 200 characters)' },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Content too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // Send message using data service
    const message = await sendMessage({
      senderId: user.id,
      recipientId,
      subject,
      content,
    })

    return NextResponse.json({
      success: true,
      data: message
    }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
