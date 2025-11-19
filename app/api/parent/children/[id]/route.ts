import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mockChild = {
      id: params.id,
      name: 'Alice Johnson',
      grade: 'Grade 10',
      age: 15,
      photo: '/avatars/alice.jpg',
      email: 'alice@example.com',
      phone: '+1234567890',
      totalCourses: 5,
      overallPerformance: 85,
      attendanceRate: 92,
      status: 'active',
      enrolledCourses: [],
      performance: {},
      attendance: {}
    }

    return NextResponse.json({ success: true, data: { child: mockChild } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch child details' },
      { status: 500 }
    )
  }
}
