import { NextRequest, NextResponse } from 'next/server'

// GET /api/teacher/live-classes/[id]/attendance - Get attendance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') // csv, pdf, json

    // TODO: Get attendance from database or platform API
    const mockAttendance = {
      classId,
      totalStudents: 25,
      attended: 23,
      attendanceRate: 92,
      students: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          joinTime: '2024-01-20T10:02:00',
          leaveTime: '2024-01-20T10:58:00',
          duration: 56,
          status: 'attended'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          joinTime: '2024-01-20T10:00:00',
          leaveTime: '2024-01-20T11:00:00',
          duration: 60,
          status: 'attended'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          joinTime: null,
          leaveTime: null,
          duration: 0,
          status: 'absent'
        }
      ]
    }

    // Handle export formats
    if (format === 'csv') {
      const csv = [
        'Name,Email,Join Time,Leave Time,Duration (min),Status',
        ...mockAttendance.students.map(s => 
          `${s.name},${s.email},${s.joinTime || 'N/A'},${s.leaveTime || 'N/A'},${s.duration},${s.status}`
        )
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="attendance-${classId}.csv"`
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: mockAttendance
    })
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to get attendance' },
      { status: 500 }
    )
  }
}
