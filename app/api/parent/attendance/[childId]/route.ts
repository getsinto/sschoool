import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const mockAttendance = {
      summary: {
        overallRate: 92,
        presentDays: 46,
        absentDays: 4,
        lateJoins: 2
      },
      calendar: [],
      byCourse: [],
      missedClasses: []
    }

    return NextResponse.json({ success: true, data: mockAttendance })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
}
