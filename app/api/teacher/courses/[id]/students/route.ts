import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock enrolled students data
const mockEnrolledStudents = {
  '1': [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      avatar: '/avatars/sarah.jpg',
      enrolledAt: '2024-01-15',
      progress: 85,
      lastActivity: '2024-01-20',
      quizAverage: 92,
      completedLessons: 36,
      totalLessons: 42,
      status: 'active'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.c@email.com',
      avatar: '/avatars/michael.jpg',
      enrolledAt: '2024-01-14',
      progress: 65,
      lastActivity: '2024-01-19',
      quizAverage: 88,
      completedLessons: 27,
      totalLessons: 42,
      status: 'active'
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma.d@email.com',
      avatar: '/avatars/emma.jpg',
      enrolledAt: '2024-01-14',
      progress: 92,
      lastActivity: '2024-01-20',
      quizAverage: 95,
      completedLessons: 39,
      totalLessons: 42,
      status: 'active'
    },
    {
      id: '4',
      name: 'Alex Thompson',
      email: 'alex.t@email.com',
      avatar: '/avatars/alex.jpg',
      enrolledAt: '2024-01-12',
      progress: 45,
      lastActivity: '2024-01-18',
      quizAverage: 78,
      completedLessons: 19,
      totalLessons: 42,
      status: 'at-risk'
    },
    {
      id: '5',
      name: 'Jessica Lee',
      email: 'jessica.l@email.com',
      avatar: '/avatars/jessica.jpg',
      enrolledAt: '2024-01-10',
      progress: 100,
      lastActivity: '2024-01-19',
      quizAverage: 98,
      completedLessons: 42,
      totalLessons: 42,
      status: 'completed'
    }
  ]
}

// GET /api/teacher/courses/[id]/students - Get enrolled students
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'recent'

    let students = mockEnrolledStudents[courseId as keyof typeof mockEnrolledStudents] || []

    // Search
    if (search) {
      const searchLower = search.toLowerCase()
      students = students.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      )
    }

    // Filter by status
    if (status !== 'all') {
      students = students.filter(student => student.status === status)
    }

    // Sort
    switch (sortBy) {
      case 'name':
        students.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'progress':
        students.sort((a, b) => b.progress - a.progress)
        break
      case 'quiz':
        students.sort((a, b) => b.quizAverage - a.quizAverage)
        break
      case 'recent':
      default:
        students.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
    }

    return NextResponse.json({
      students,
      total: students.length,
      summary: {
        total: students.length,
        active: students.filter(s => s.status === 'active').length,
        completed: students.filter(s => s.status === 'completed').length,
        atRisk: students.filter(s => s.status === 'at-risk').length,
        averageProgress: Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length),
        averageQuizScore: Math.round(students.reduce((sum, s) => sum + s.quizAverage, 0) / students.length)
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST /api/teacher/courses/[id]/students - Bulk message students
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { studentIds, message, subject } = body

    if (!studentIds || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In production, send messages via notification system
    return NextResponse.json({
      message: 'Messages sent successfully',
      sentTo: studentIds.length
    })
  } catch (error) {
    console.error('Error sending messages:', error)
    return NextResponse.json(
      { error: 'Failed to send messages' },
      { status: 500 }
    )
  }
}
