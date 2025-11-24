import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const courseId = searchParams.get('courseId')
    const sort = searchParams.get('sort') || 'date'

    // Mock data - replace with actual database queries
    const mockQuizzes = [
      {
        id: '1',
        title: 'Algebra Fundamentals Quiz',
        courseName: 'Advanced Mathematics',
        courseId: 'math-101',
        questionsCount: 15,
        duration: 30,
        maxPoints: 100,
        attempts: 2,
        maxAttempts: 3,
        bestScore: 85,
        lastScore: 85,
        status: 'completed' as const,
        passed: true
      },
      {
        id: '2',
        title: 'Physics Laws Quiz',
        courseName: 'Physics',
        courseId: 'phys-201',
        questionsCount: 20,
        duration: 45,
        maxPoints: 150,
        attempts: 1,
        maxAttempts: 2,
        bestScore: 65,
        lastScore: 65,
        status: 'failed' as const,
        passed: false
      },
      {
        id: '3',
        title: 'World War I Quiz',
        courseName: 'World History',
        courseId: 'hist-101',
        questionsCount: 10,
        duration: 20,
        maxPoints: 80,
        attempts: 0,
        maxAttempts: 2,
        status: 'available' as const
      },
      {
        id: '4',
        title: 'Chemical Reactions Quiz',
        courseName: 'Chemistry',
        courseId: 'chem-101',
        questionsCount: 12,
        duration: 25,
        maxPoints: 90,
        attempts: 1,
        maxAttempts: 3,
        bestScore: 78,
        lastScore: 78,
        status: 'completed' as const,
        passed: true
      },
      {
        id: '5',
        title: 'Shakespeare Quiz',
        courseName: 'English Literature',
        courseId: 'eng-201',
        questionsCount: 18,
        duration: 35,
        maxPoints: 120,
        attempts: 0,
        maxAttempts: 2,
        status: 'available' as const
      }
    ]

    let filteredQuizzes = mockQuizzes

    // Apply filters
    if (status && status !== 'all') {
      if (status === 'available') {
        filteredQuizzes = filteredQuizzes.filter(q => q.attempts === 0)
      } else if (status === 'completed') {
        filteredQuizzes = filteredQuizzes.filter(q => q.attempts > 0 && q.passed)
      } else if (status === 'failed') {
        filteredQuizzes = filteredQuizzes.filter(q => q.attempts > 0 && !q.passed)
      }
    }

    if (courseId && courseId !== 'all') {
      filteredQuizzes = filteredQuizzes.filter(q => q.courseId === courseId)
    }

    // Apply sorting
    filteredQuizzes.sort((a, b) => {
      switch (sort) {
        case 'score':
          return (b.bestScore || 0) - (a.bestScore || 0)
        case 'course':
          return a.courseName.localeCompare(b.courseName)
        case 'title':
          return a.title.localeCompare(b.title)
        default: // date
          return a.id.localeCompare(b.id)
      }
    })

    // Calculate summary
    const summary = {
      totalTaken: filteredQuizzes.filter(q => q.attempts > 0).length,
      averageScore: filteredQuizzes
        .filter(q => q.bestScore !== undefined)
        .reduce((acc, q) => acc + (q.bestScore! / q.maxPoints) * 100, 0) /
        filteredQuizzes.filter(q => q.bestScore !== undefined).length || 0,
      passed: filteredQuizzes.filter(q => q.passed).length,
      needRetake: filteredQuizzes.filter(q => q.attempts > 0 && !q.passed).length
    }

    return NextResponse.json({
      success: true,
      data: {
        quizzes: filteredQuizzes,
        summary
      }
    })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
