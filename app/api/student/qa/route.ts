import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/student/qa - Get questions for a lesson
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lessonId = searchParams.get('lessonId')

    // TODO: Get student ID from session
    const studentId = 'student_123'

    // TODO: Fetch from database
    const mockQuestions = [
      {
        id: 'qa1',
        lessonId,
        studentId: 'student_456',
        studentName: 'John Doe',
        question: 'Can you explain the difference between factoring by grouping and using special patterns?',
        createdAt: '2024-01-20T09:00:00',
        status: 'answered',
        votes: 5,
        answers: [
          {
            id: 'ans1',
            questionId: 'qa1',
            authorId: 'teacher_1',
            authorName: 'Prof. Anderson',
            authorRole: 'teacher',
            answer: 'Great question! Factoring by grouping is used when you have four terms, while special patterns apply to specific forms like difference of squares.',
            createdAt: '2024-01-20T10:00:00',
            votes: 8,
            isAccepted: true
          }
        ]
      },
      {
        id: 'qa2',
        lessonId,
        studentId,
        studentName: 'Current Student',
        question: 'What if the coefficient of a² is not 1?',
        createdAt: '2024-01-21T14:00:00',
        status: 'open',
        votes: 2,
        answers: []
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockQuestions
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/student/qa - Ask question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, question } = body

    // TODO: Get student ID from session
    const studentId = 'student_123'
    const studentName = 'Current Student'

    // TODO: Save to database
    const newQuestion = {
      id: `qa_${Date.now()}`,
      lessonId,
      studentId,
      studentName,
      question,
      createdAt: new Date().toISOString(),
      status: 'open',
      votes: 0,
      answers: []
    }

    return NextResponse.json({
      success: true,
      data: newQuestion,
      message: 'Question posted successfully'
    })
  } catch (error) {
    console.error('Error posting question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to post question' },
      { status: 500 }
    )
  }
}
