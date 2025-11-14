import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/admin/communication/support-tickets/[id]/reply
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { content, isInternal, attachments } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const reply = {
      id: `reply_${Date.now()}`,
      ticketId: params.id,
      sender: 'admin',
      senderName: 'Admin User',
      content,
      isInternal: isInternal || false,
      attachments: attachments || [],
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Reply added successfully',
      reply
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    )
  }
}
