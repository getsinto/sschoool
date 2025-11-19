import { NextRequest, NextResponse } from 'next/server'

// POST /api/student/live-classes/[id]/feedback - Submit class feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id
    const body = await request.json()
    const { rating, feedback, issues } = body

    // Mock response - replace with actual database operation
    const mockResponse = {
      id: `feedback-${Date.now()}`,
      classId,
      rating,
      feedback,
      issues,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: mockResponse
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
