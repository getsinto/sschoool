import { NextRequest, NextResponse } from 'next/server'
import { geminiChatbot, UserContext } from '@/lib/chatbot/gemini'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, userContext } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build user context (in production, get from session/database)
    const context: UserContext = {
      userId: userContext?.userId,
      userName: userContext?.userName || 'User',
      userRole: userContext?.userRole || 'guest',
      currentPage: userContext?.currentPage,
      enrolledCourses: userContext?.enrolledCourses || [],
      conversationHistory: conversationHistory || []
    }

    // Send message to Gemini
    const response = await geminiChatbot.sendMessage(message, context)

    // Check if should escalate
    const shouldEscalate = geminiChatbot.shouldEscalate(message, response.confidence)

    return NextResponse.json({
      message: response.message,
      suggestions: response.suggestions,
      actions: response.actions,
      shouldEscalate,
      confidence: response.confidence
    })
  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
