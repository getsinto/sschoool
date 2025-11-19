import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id

    // Mock data - replace with actual database queries
    const mockAssignment = {
      id: assignmentId,
      title: 'Math Problem Set 1',
      courseName: 'Advanced Mathematics',
      courseId: 'math-101',
      instructor: 'Dr. Smith',
      dueDate: '2024-01-25T23:59:59Z',
      maxPoints: 100,
      status: 'not_started',
      description: 'Complete problems 1-20 from chapter 3. Show all work and explain your reasoning for each problem.',
      instructions: `
        ## Instructions
        1. Read each problem carefully
        2. Show all your work
        3. Explain your reasoning
        4. Submit before the deadline
        
        ## Grading Criteria
        - Correct answers: 60%
        - Work shown: 30%
        - Explanations: 10%
      `,
      attachments: [
        {
          name: 'problem-set-1.pdf',
          url: '/files/problem-set-1.pdf',
          size: 245000
        }
      ],
      relatedLessons: [
        {
          id: 'lesson-1',
          title: 'Introduction to Quadratic Equations',
          type: 'video'
        },
        {
          id: 'lesson-2',
          title: 'Solving Quadratic Equations',
          type: 'document'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: mockAssignment
    })
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}
