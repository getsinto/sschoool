import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { geminiChatbot } from '@/lib/chatbot/gemini'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const { message, conversationId, context } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      const { data } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()
      conversation = data
    }

    if (!conversation && user) {
      const { data: newConv } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          started_at: new Date().toISOString()
        })
        .select('*')
        .single()
      conversation = newConv
    }

    // Save user message
    if (conversation) {
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        })
    }

    // Get AI response
    const userContext = {
      userId: user?.id,
      userRole: context?.userRole || 'guest',
      userName: context?.userName,
      userEmail: user?.email
    }

    const response = await geminiChatbot.sendMessage(message, userContext)

    // Save bot message
    if (conversation) {
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          intent: response.intent,
          confidence: response.confidence,
          actions: response.actions
        })
    }

    // Record analytics
    await supabase
      .from('chatbot_analytics')
      .insert({
        conversation_id: conversation?.id,
        query: message,
        intent: response.intent,
        confidence_score: response.confidence,
        resolved: response.confidence && response.confidence > 0.7,
        escalated: response.actions?.some((a: any) => a.type === 'escalate'),
        response_time_ms: 0
      })

    return NextResponse.json({
      message: response.content,
      response,
      conversationId: conversation?.id,
      suggestions: response.suggestions,
      success: true
    })
  } catch (error: any) {
    console.error('Chatbot message error:', error)
    
    // Return a user-friendly error response
    return NextResponse.json({
      message: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact our support team for immediate assistance.",
      response: {
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact our support team for immediate assistance.",
        intent: 'error',
        confidence: 0,
        suggestions: ['Try Again', 'Contact Support', 'View FAQs']
      },
      suggestions: ['Try Again', 'Contact Support', 'View FAQs'],
      success: false,
      error: error.message || 'Failed to process message'
    }, { status: 200 }) // Return 200 so frontend can display the message
  }
}
