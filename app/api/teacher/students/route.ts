import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/teacher/students - Get students list
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const progressMin = searchParams.get('progressMin')
    const progressMax = searchParams.get('progressMax')
    const lastActivity = searchParams.get('lastActivity')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'name'

    // TODO: Get teacher ID from session
    const teacherId = 'teacher_123'

    // TODO: Fetch from database
    const mockStudents = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        avatar: '/avatars/sarah.jpg',
        enrollmentDate: '2024-01-10',
        status: 'active',
        enrolledCourses: 3,
        completedCourses: 1,
        overallProgress: 85,
        averageGrade: 92,
        lastActive: '2024-01-20T14:30:00',
        attendanceRate: 95,
        assignmentsCompleted: 12,
        totalAssignments: 15
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 123-4568',
        avatar: '/avatars/michael.jpg',
        enrollmentDate: '2024-01-08',
        status: 'active',
        enrolledCourses: 2,
        completedCourses: 0,
        overallProgress: 72,
        averageGrade: 78,
        lastActive: '2024-01-19T16:45:00',
        attendanceRate: 88,
        assignmentsCompleted: 10,
        totalAssignments: 14
      }
    ]

    // Filter by search
    let filtered = search
      ? mockStudents.filter(s =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase())
        )
      : mockStudents

    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(s => s.status === status)
    }

    // Filter by progress range
    if (progressMin) {
      filtered = filtered.filter(s => s.overallProgress >= parseInt(progressMin))
    }
    if (progressMax) {
      filtered = filtered.filter(s => s.overallProgress <= parseInt(progressMax))
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'progress':
          return b.overallProgress - a.overallProgress
        case 'grade':
          return b.averageGrade - a.averageGrade
        case 'lastActive':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        default:
          return 0
      }
    })

    return NextResponse.json({
      success: true,
      data: filtered,
      meta: {
        total: filtered.length,
        active: filtered.filter(s => s.status === 'active').length,
        inactive: filtered.filter(s => s.status === 'inactive').length
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}
