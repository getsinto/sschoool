import { NextRequest, NextResponse } from 'next/server'

// GET /api/teacher/grading/assignments - Get assignment submissions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status') || 'pending'
    const sortBy = searchParams.get('sortBy') || 'oldest'

    // TODO: Get teacher ID from session
    const teacherId = 'teacher_123'

    // TODO: Fetch from database
    const mockAssignmentSubmissions = [
      {
        id: '1',
        submissionId: 'sub_456',
        assignmentId: 'assign_1',
        assignmentTitle: 'Physics Lab Report',
        courseId: 'course_2',
        courseName: 'Grade 9 Physics',
        student: {
          id: 'student_3',
          name: 'Emma Davis',
          email: 'emma@example.com',
          avatar: '/avatars/emma.jpg'
        },
        submittedAt: '2024-01-18T20:15:00',
        dueDate: '2024-01-21T23:59:00',
        isLate: false,
        latePenalty: 0,
        submissionType: 'file',
        fileCount: 2,
        wordCount: null,
        maxPoints: 100,
        status: 'pending'
      },
      {
        id: '2',
        submissionId: 'sub_457',
        assignmentId: 'assign_2',
        assignmentTitle: 'English Essay - Character Analysis',
        courseId: 'course_3',
        courseName: 'Grade 8 English',
        student: {
          id: 'student_4',
          name: 'Alex Thompson',
          email: 'alex@example.com',
          avatar: '/avatars/alex.jpg'
        },
        submittedAt: '2024-01-17T22:30:00',
        dueDate: '2024-01-18T23:59:00',
        isLate: true,
        latePenalty: 10,
        submissionType: 'text',
        fileCount: 0,
        wordCount: 1250,
        maxPoints: 100,
        grade: 88,
        status: 'graded'
      }
    ]

    // Filter by course
    let filtered = courseId 
      ? mockAssignmentSubmissions.filter(a => a.courseId === courseId)
      : mockAssignmentSubmissions

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(a => a.status === status)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        case 'newest':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
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
        pending: filtered.filter(a => a.status === 'pending').length,
        graded: filtered.filter(a => a.status === 'graded').length,
        late: filtered.filter(a => a.isLate).length
      }
    })
  } catch (error) {
    console.error('Error fetching assignment submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignment submissions' },
      { status: 500 }
    )
  }
}
