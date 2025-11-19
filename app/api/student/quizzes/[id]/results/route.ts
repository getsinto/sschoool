import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id

    // Mock data - replace with actual database queries
    const mockResults = {
      quiz: {
        id: quizId,
        title: 'Algebra Fundamentals Quiz',
        courseName: 'Advanced Mathematics',
        maxPoints: 100,
        passingScore: 70,
        questionsCount: 15
      },
      latestAttempt: {
        id: 'attempt-2',
        attemptNumber: 2,
        startedAt: '2024-01-16T14:00:00Z',
        completedAt: '2024-01-16T14:28:00Z',
        score: 85,
        maxScore: 100,
        percentage: 85,
        passed: true,
        timeSpent: 1680,
        answers: [
          {
            questionId: 'q1',
            question: 'What is the value of x in the equation 2x + 5 = 15?',
            userAnswer: '5',
            correctAnswer: '5',
            isCorrect: true,
            points: 10,
            maxPoints: 10,
            explanation: 'Correct! Subtract 5 from both sides, then divide by 2.'
          },
          {
            questionId: 'q2',
            question: 'Solve for y: 3y - 7 = 14',
            userAnswer: '7',
            correctAnswer: '7',
            isCorrect: true,
            points: 10,
            maxPoints: 10,
            explanation: 'Correct! Add 7 to both sides, then divide by 3.'
          },
          {
            questionId: 'q3',
            question: 'What is the slope of the line y = 2x + 3?',
            userAnswer: '3',
            correctAnswer: '2',
            isCorrect: false,
            points: 0,
            maxPoints: 10,
            explanation: 'The slope is the coefficient of x, which is 2. The 3 is the y-intercept.'
          }
        ]
      },
      allAttempts: [
        {
          attemptNumber: 1,
          score: 75,
          percentage: 75,
          completedAt: '2024-01-15T10:25:00Z'
        },
        {
          attemptNumber: 2,
          score: 85,
          percentage: 85,
          completedAt: '2024-01-16T14:28:00Z'
        }
      ],
      statistics: {
        correctAnswers: 12,
        incorrectAnswers: 3,
        accuracy: 80,
        averageTimePerQuestion: 112
      }
    }

    return NextResponse.json({
      success: true,
      data: mockResults
    })
  } catch (error) {
    console.error('Error fetching quiz results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz results' },
      { status: 500 }
    )
  }
}
