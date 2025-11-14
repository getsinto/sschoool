import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/admin/communication/chatbot/query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // In production, integrate with Google Gemini API
    // For now, return mock response
    const response = {
      query,
      answer: 'This is a simulated chatbot response. In production, this will use Google Gemini API to generate intelligent responses.',
      confidence: 0.85,
      matchedFAQ: null,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    )
  }
}
