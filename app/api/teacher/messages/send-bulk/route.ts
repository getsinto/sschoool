import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '@/lib/teacher/data-service'

export const dynamic = 'force-dynamic'

// POST /api/teacher/messages/send-bulk - Send bulk messages
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
    const { recipientIds, subject, content } = body

    // Validate input
    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipient IDs must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!subject || !content) {
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

    if (recipientIds.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Cannot send to more than 100 recipients at once' },
        { status: 400 }
      )
    }

    // Send messages to all recipients
    const results = await Promise.allSettled(
      recipientIds.map(recipientId =>
        sendMessage({
          senderId: user.id,
          recipientId,
          subject,
          content,
        })
      )
    )

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    // Get successful messages
    const messages = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value)

    return NextResponse.json({
      success: true,
      data: {
        messages,
        stats: {
          total: recipientIds.length,
          successful,
          failed,
        }
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error sending bulk messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send bulk messages' },
      { status: 500 }
    )
  }
}
