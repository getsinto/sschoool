import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/student/learn/[lessonId] - Get lesson content
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lessonId = params.lessonId

    // TODO: Get student ID from session
    const studentId = 'student_123'

    // TODO: Fetch from database based on lesson type
    // This is a mock response - actual implementation would vary by lesson type
    const mockLesson = {
      id: lessonId,
      courseId: 'c1',
      sectionId: 's2',
      title: 'Special Factoring Patterns',
      description: 'Learn about special factoring patterns including difference of squares, perfect square trinomials, and sum/difference of cubes.',
      type: 'video', // or 'document', 'quiz', 'assignment', 'live_class'
      duration: '15 min',
      order: 2,
      completed: false,
      locked: false,
      progress: 45, // percentage
      lastPosition: 135, // seconds for video
      content: {
        // For video lessons
        videoUrl: '/videos/factoring-patterns.mp4',
        chapters: [
          { time: 0, title: 'Introduction' },
          { time: 120, title: 'Difference of Squares' },
          { time: 300, title: 'Perfect Square Trinomials' },
          { time: 600, title: 'Sum and Difference of Cubes' }
        ],
        transcript: [
          { time: '0:00', text: 'Welcome to this lesson on special factoring patterns.' },
          { time: '0:15', text: 'Today we\'ll cover three important patterns that make factoring easier.' },
          { time: '0:30', text: 'First, let\'s look at the difference of squares pattern: a² - b² = (a+b)(a-b)' }
        ]
      },
      resources: [
        {
          id: 'r1',
          title: 'Factoring Patterns Cheat Sheet',
          type: 'pdf',
          url: '/resources/patterns.pdf'
        },
        {
          id: 'r2',
          title: 'Practice Problems',
          type: 'pdf',
          url: '/resources/practice.pdf'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: mockLesson
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lesson content' },
      { status: 500 }
    )
  }
}
