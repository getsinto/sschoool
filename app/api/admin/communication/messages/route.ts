import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const mockConversations = [
  {
    id: '1',
    userId: 'user_1',
    userName: 'John Doe',
    userRole: 'student',
    lastMessage: 'Thank you for your help!',
    lastMessageAt: '2024-01-15T10:00:00Z',
    unreadCount: 0,
    status: 'resolved'
  }
]

// GET /api/admin/communication/messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role')

    let filtered = [...mockConversations]

    if (status && status !== 'all') {
      filtered = filtered.filter(c => c.status === status)
    }

    if (role && role !== 'all') {
      filtered = filtered.filter(c => c.userRole === role)
    }

    return NextResponse.json({ conversations: filtered })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
