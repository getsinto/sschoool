import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientId, recipientType, childId, subject, message, attachments } = body

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId: 'msg_123',
        conversationId: 'conv_123'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
