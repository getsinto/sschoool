import { NextRequest, NextResponse } from 'next/server'

// GET /api/parent/children - Get all linked children
export async function GET(request: NextRequest) {
  try {
    // Mock data - replace with actual database query
    const mockChildren = [
      {
        id: '1',
        name: 'Alice Johnson',
        grade: 'Grade 10',
        age: 15,
        photo: '/avatars/alice.jpg',
        totalCourses: 5,
        overallPerformance: 85,
        attendanceRate: 92,
        status: 'active'
      },
      {
        id: '2',
        name: 'Bob Johnson',
        grade: 'Grade 8',
        age: 13,
        photo: '/avatars/bob.jpg',
        totalCourses: 4,
        overallPerformance: 78,
        attendanceRate: 88,
        status: 'active'
      }
    ]

    return NextResponse.json({
      success: true,
      data: { children: mockChildren }
    })
  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch children' },
      { status: 500 }
    )
  }
}
