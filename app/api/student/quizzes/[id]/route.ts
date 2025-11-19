import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id

    // Mock data - replace with actual database queries
    const mockQuiz = {
      id: quizId,
      title: 'Algebra Fundamentals Quiz',
      courseName: 'Advanced Mathematics',
      courseId: 'math-101',
      instructor: 'Dr. Smith',
      questionsCount: 15,
      duration: 30,
      maxPoints: 100,
      attempts: 2,
      maxAttempts: 3,
      bestScore: 85,
      lastScore: 85,
      status: 'completed' as const,
      passed: true,
      passingScore: 70,
      description: 'Test your understanding of fundamental algebra concepts',
      instructions: 'Answer all questions to the best of your ability. You have 30 minutes to complete this quiz.',
      questions: [
        {
          id: 'q1',
          question: 'What is the value of x in the equation 2x + 5 = 15?',
          type: 'multiple_choice',
          options: ['5', '10', '7.5', '20'],
          correctAnswer: '5',
          points: 10
        },
        {
          id: 'q2',
          question: 'Solve for y: 3y - 7 = 14',
          type: 'multiple_choice',
          options: ['7', '21', '5', '3'],
          correctAnswer: '7',
          points: 10
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: mockQuiz
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}
