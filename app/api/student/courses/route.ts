import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/student/courses - Get enrolled courses
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // all, in_progress, completed
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'recent'

    // TODO: Get student ID from session
    const studentId = 'student_123'

    // TODO: Fetch from database
    const mockCourses = [
      {
        id: 'c1',
        title: 'Advanced Mathematics',
        category: 'Mathematics',
        grade: 'Grade 10',
        thumbnail: '/courses/math.jpg',
        progress: 75,
        lessonsCompleted: 15,
        totalLessons: 20,
        averageGrade: 92,
        lastAccessed: '2024-01-22T14:30:00',
        status: 'in_progress',
        instructor: 'Prof. Anderson',
        isBookmarked: true,
        hasCertificate: false,
        enrolledDate: '2024-01-01'
      },
      {
        id: 'c2',
        title: 'Physics Fundamentals',
        category: 'Science',
        grade: 'Grade 9',
        thumbnail: '/courses/physics.jpg',
        progress: 60,
        lessonsCompleted: 15,
        totalLessons: 25,
        averageGrade: 88,
        lastAccessed: '2024-01-21T16:45:00',
        status: 'in_progress',
        instructor: 'Dr. Smith',
        isBookmarked: false,
        hasCertificate: false,
        enrolledDate: '2024-01-01'
      }
    ]

    // Filter by status
    let filtered = status && status !== 'all'
      ? mockCourses.filter(c => c.status === status)
      : mockCourses

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter(c => c.category === category)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
        case 'progress':
          return b.progress - a.progress
        case 'newest':
          return new Date(b.enrolledDate).getTime() - new Date(a.enrolledDate).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return NextResponse.json({
      success: true,
      data: filtered
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
