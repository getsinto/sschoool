import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const mockConversations = {
      conversations: [
        {
          id: 'conv_1',
          recipient: {
            id: 'teacher_1',
            name: 'Dr. Sarah Johnson',
            photo: '/avatars/teacher.jpg',
            type: 'teacher'
          },
          lastMessage: {
            text: 'Thank you for your question...',
            timestamp: '2024-01-15T10:00:00Z'
          },
          unreadCount: 2,
          childContext: {
            id: 'child_1',
            name: 'Alice Johnson'
          }
        }
      ]
    }

    return NextResponse.json({ success: true, data: mockConversations })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
