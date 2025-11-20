import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    const { messageId, rating, feedback } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    if (rating === undefined || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Update message with feedback
    const { error: updateError } = await supabase
      .from('chat_messages')
      .update({
        feedback_rating: rating,
        feedback_text: feedback || null
      })
      .eq('id', messageId)

    if (updateError) {
      console.error('Feedback update error:', updateError)
      throw updateError
    }

    return NextResponse.json({
      message: 'Feedback recorded successfully',
      success: true
    })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    )
  }
}
