import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id

    // Mock data - replace with actual database queries
    const mockAttempts = [
      {
        id: '1',
        quizId,
        attemptNumber: 1,
        startedAt: '2024-01-15T10:00:00Z',
        completedAt: '2024-01-15T10:25:00Z',
        score: 75,
        maxScore: 100,
        percentage: 75,
        passed: true,
        timeSpent: 1500,
        answers: [
          { questionId: '1', answer: 'A', correct: true, points: 10 },
          { questionId: '2', answer: 'B', correct: false, points: 0 },
          { questionId: '3', answer: 'C', correct: true, points: 10 }
        ]
      },
      {
        id: '2',
        quizId,
        attemptNumber: 2,
        startedAt: '2024-01-16T14:00:00Z',
        completedAt: '2024-01-16T14:28:00Z',
        score: 85,
        maxScore: 100,
        percentage: 85,
        passed: true,
        timeSpent: 1680,
        answers: [
          { questionId: '1', answer: 'A', correct: true, points: 10 },
          { questionId: '2', answer: 'C', correct: true, points: 10 },
          { questionId: '3', answer: 'C', correct: true, points: 10 }
        ]
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockAttempts
    })
  } catch (error) {
    console.error('Error fetching quiz attempts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz attempts' },
      { status: 500 }
    )
  }
}
