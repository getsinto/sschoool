import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/admin/communication/messages/send
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, content, attachments } = body

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const message = {
      id: `msg_${Date.now()}`,
      userId,
      content,
      attachments: attachments || [],
      sentAt: new Date().toISOString(),
      sender: 'admin'
    }

    return NextResponse.json({
      message: 'Message sent successfully',
      data: message
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
