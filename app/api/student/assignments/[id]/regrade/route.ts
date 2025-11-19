import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id
    const body = await request.json()
    const { reason, details } = body

    if (!reason || !details) {
      return NextResponse.json(
        { success: false, error: 'Reason and details are required' },
        { status: 400 }
      )
    }

    // Mock implementation - replace with actual database operations
    const regradeRequest = {
      id: `regrade-${Date.now()}`,
      assignmentId,
      reason,
      details,
      status: 'pending',
      requestedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: regradeRequest,
      message: 'Regrade request submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting regrade request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit regrade request' },
      { status: 500 }
    )
  }
}
