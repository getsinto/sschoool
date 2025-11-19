import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id

    // Mock data - replace with actual database queries
    const mockSubmissions = [
      {
        id: '1',
        assignmentId,
        submittedAt: '2024-01-10T15:30:00Z',
        status: 'graded',
        grade: 85,
        maxPoints: 100,
        feedback: 'Good work overall. Pay attention to formatting.',
        files: [
          { name: 'essay.pdf', url: '/uploads/essay.pdf', size: 245000 }
        ],
        attempt: 1
      },
      {
        id: '2',
        assignmentId,
        submittedAt: '2024-01-09T10:00:00Z',
        status: 'draft',
        content: 'Work in progress...',
        files: [],
        attempt: 0
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockSubmissions
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
