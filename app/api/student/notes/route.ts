import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/student/notes - Get notes for a lesson
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lessonId = searchParams.get('lessonId')

    // TODO: Get student ID from session
    const studentId = 'student_123'

    // TODO: Fetch from database
    const mockNotes = [
      {
        id: 'n1',
        studentId,
        lessonId,
        content: 'Remember: difference of squares only works with subtraction',
        timestamp: '2:30',
        tags: ['important', 'factoring'],
        screenshots: [],
        createdAt: '2024-01-20T10:30:00',
        updatedAt: '2024-01-20T10:30:00'
      },
      {
        id: 'n2',
        studentId,
        lessonId,
        content: 'Perfect square trinomial: a² + 2ab + b² = (a+b)²',
        timestamp: '5:45',
        tags: ['formula'],
        screenshots: [],
        createdAt: '2024-01-20T10:35:00',
        updatedAt: '2024-01-20T10:35:00'
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockNotes
    })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

// POST /api/student/notes - Create note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, content, timestamp, tags, screenshots } = body

    // TODO: Get student ID from session
    const studentId = 'student_123'

    // TODO: Save to database
    const newNote = {
      id: `n_${Date.now()}`,
      studentId,
      lessonId,
      content,
      timestamp,
      tags: tags || [],
      screenshots: screenshots || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newNote,
      message: 'Note created successfully'
    })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
