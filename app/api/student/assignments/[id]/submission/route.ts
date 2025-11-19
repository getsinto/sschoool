import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/student/assignments/[id]/submission - Get submission status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id

    // TODO: Get student ID from session
    const studentId = 'student_123'

    // TODO: Fetch from database
    const mockSubmission = {
      id: 'sub_123',
      assignmentId,
      studentId,
      submittedAt: '2024-01-25T14:30:00',
      status: 'graded', // 'draft', 'submitted', 'graded'
      files: [
        {
          id: 'file_1',
          name: 'factoring-solutions.pdf',
          size: 2048000,
          type: 'application/pdf',
          url: '/uploads/factoring-solutions.pdf'
        }
      ],
      textContent: null,
      attemptNumber: 1,
      grade: 95,
      maxPoints: 100,
      feedback: 'Excellent work! Your solutions are clear and well-explained. Minor improvement needed in problem 3.',
      feedbackFiles: [
        {
          id: 'feedback_1',
          name: 'graded-assignment.pdf',
          url: '/feedback/graded-assignment.pdf'
        }
      ],
      gradedAt: '2024-01-26T10:00:00',
      gradedBy: 'Prof. Anderson'
    }

    return NextResponse.json({
      success: true,
      data: mockSubmission
    })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}
