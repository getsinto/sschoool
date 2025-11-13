import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/teacher/grading/quizzes - Get pending quiz submissions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status') || 'pending'
    const sortBy = searchParams.get('sortBy') || 'oldest'

    // TODO: Get teacher ID from session
    const teacherId = 'teacher_123'

    // TODO: Fetch from database
    const mockQuizSubmissions = [
      {
        id: '1',
        attemptId: 'attempt_123',
        quizId: 'quiz_1',
        quizTitle: 'Mathematics Quiz - Chapter 5',
        courseId: 'course_1',
        courseName: 'Grade 10 Mathematics',
        student: {
          id: 'student_1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          avatar: '/avatars/sarah.jpg'
        },
        submittedAt: '2024-01-20T14:30:00',
        totalQuestions: 15,
        mcqQuestions: 12,
        shortAnswerQuestions: 3,
        autoGradedScore: 85,
        maxPoints: 100,
        status: 'pending',
        needsManualReview: true
      },
      {
        id: '2',
        attemptId: 'attempt_124',
        quizId: 'quiz_2',
        quizTitle: 'Physics Quiz - Forces',
        courseId: 'course_2',
        courseName: 'Grade 9 Physics',
        student: {
          id: 'student_2',
          name: 'Michael Chen',
          email: 'michael@example.com',
          avatar: '/avatars/michael.jpg'
        },
        submittedAt: '2024-01-19T16:45:00',
        totalQuestions: 10,
        mcqQuestions: 10,
        shortAnswerQuestions: 0,
        autoGradedScore: 92,
        maxPoints: 100,
        status: 'graded',
        needsManualReview: false
      }
    ]

    // Filter by course
    let filtered = courseId 
      ? mockQuizSubmissions.filter(q => q.courseId === courseId)
      : mockQuizSubmissions

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(q => q.status === status)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        case 'newest':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        case 'student':
          return a.student.name.localeCompare(b.student.name)
        case 'course':
          return a.courseName.localeCompare(b.courseName)
        default:
          return 0
      }
    })

    return NextResponse.json({
      success: true,
      data: filtered,
      meta: {
        total: filtered.length,
        pending: filtered.filter(q => q.status === 'pending').length,
        graded: filtered.filter(q => q.status === 'graded').length
      }
    })
  } catch (error) {
    console.error('Error fetching quiz submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz submissions' },
      { status: 500 }
    )
  }
}
