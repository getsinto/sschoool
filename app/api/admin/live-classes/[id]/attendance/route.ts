import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  studentPhoto?: string
  email: string
  joinTime: string
  leaveTime: string | null
  duration: number
  status: 'present' | 'absent' | 'late'
}

// Mock attendance data
const mockAttendance = new Map<string, AttendanceRecord[]>([
  ['class_1', [
    {
      id: 'att_1',
      studentId: 'student_1',
      studentName: 'John Doe',
      studentPhoto: '/api/placeholder/32/32',
      email: 'john.doe@example.com',
      joinTime: '2024-01-20T10:02:00Z',
      leaveTime: '2024-01-20T11:00:00Z',
      duration: 58,
      status: 'present'
    },
    {
      id: 'att_2',
      studentId: 'student_2',
      studentName: 'Jane Smith',
      studentPhoto: '/api/placeholder/32/32',
      email: 'jane.smith@example.com',
      joinTime: '2024-01-20T10:15:00Z',
      leaveTime: '2024-01-20T11:00:00Z',
      duration: 45,
      status: 'late'
    },
    {
      id: 'att_3',
      studentId: 'student_3',
      studentName: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      joinTime: '2024-01-20T10:00:00Z',
      leaveTime: null,
      duration: 0,
      status: 'absent'
    }
  ]]
])

// GET /api/admin/live-classes/[id]/attendance - Get attendance for a class
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attendance = mockAttendance.get(params.id) || []
    
    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(r => r.status === 'present').length,
      late: attendance.filter(r => r.status === 'late').length,
      absent: attendance.filter(r => r.status === 'absent').length,
      averageDuration: attendance.length > 0
        ? Math.round(attendance.reduce((sum, r) => sum + r.duration, 0) / attendance.length)
        : 0
    }

    return NextResponse.json({
      attendance,
      stats
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

// POST /api/admin/live-classes/[id]/attendance - Mark attendance manually
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { studentId, status, joinTime, leaveTime, duration } = body

    if (!studentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      studentId,
      studentName: 'Student Name', // In real app, fetch from database
      email: 'student@example.com', // In real app, fetch from database
      joinTime: joinTime || new Date().toISOString(),
      leaveTime: leaveTime || null,
      duration: duration || 0,
      status
    }

    // In real app, save to database
    const classAttendance = mockAttendance.get(params.id) || []
    classAttendance.push(newRecord)
    mockAttendance.set(params.id, classAttendance)

    return NextResponse.json({
      message: 'Attendance marked successfully',
      record: newRecord
    }, { status: 201 })
  } catch (error) {
    console.error('Error marking attendance:', error)
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/live-classes/[id]/attendance - Update attendance record
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { recordId, ...updates } = body

    if (!recordId) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }

    const classAttendance = mockAttendance.get(params.id) || []
    const recordIndex = classAttendance.findIndex(r => r.id === recordId)

    if (recordIndex === -1) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }

    // Update record
    classAttendance[recordIndex] = {
      ...classAttendance[recordIndex],
      ...updates
    }

    mockAttendance.set(params.id, classAttendance)

    return NextResponse.json({
      message: 'Attendance updated successfully',
      record: classAttendance[recordIndex]
    })
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    )
  }
}
