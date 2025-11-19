import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/student/courses/[id]/curriculum - Get course curriculum
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id

    // TODO: Get student ID from session
    const studentId = 'student_123'

    // TODO: Fetch from database
    const mockCurriculum = {
      courseId,
      sections: [
        {
          id: 's1',
          title: 'Introduction to Quadratic Equations',
          order: 1,
          lessons: [
            {
              id: 'l1',
              title: 'What are Quadratic Equations?',
              type: 'video',
              duration: '15 min',
              order: 1,
              completed: true,
              locked: false
            },
            {
              id: 'l2',
              title: 'Standard Form vs Vertex Form',
              type: 'video',
              duration: '20 min',
              order: 2,
              completed: true,
              locked: false
            },
            {
              id: 'l3',
              title: 'Practice Problems - Basic Forms',
              type: 'quiz',
              duration: '10 min',
              order: 3,
              completed: true,
              locked: false
            }
          ]
        },
        {
          id: 's2',
          title: 'Factoring Techniques',
          order: 2,
          lessons: [
            {
              id: 'l4',
              title: 'Factoring by Grouping',
              type: 'video',
              duration: '25 min',
              order: 1,
              completed: true,
              locked: false
            },
            {
              id: 'l5',
              title: 'Special Factoring Patterns',
              type: 'document',
              duration: '15 min',
              order: 2,
              completed: false,
              locked: false,
              current: true
            },
            {
              id: 'l6',
              title: 'Factoring Assignment',
              type: 'assignment',
              duration: '45 min',
              order: 3,
              completed: false,
              locked: false
            }
          ]
        },
        {
          id: 's3',
          title: 'The Quadratic Formula',
          order: 3,
          lessons: [
            {
              id: 'l7',
              title: 'Deriving the Quadratic Formula',
              type: 'video',
              duration: '30 min',
              order: 1,
              completed: false,
              locked: true
            },
            {
              id: 'l8',
              title: 'Using the Discriminant',
              type: 'video',
              duration: '20 min',
              order: 2,
              completed: false,
              locked: true
            },
            {
              id: 'l9',
              title: 'Live Q&A Session',
              type: 'live_class',
              duration: '60 min',
              order: 3,
              completed: false,
              locked: true
            }
          ]
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: mockCurriculum
    })
  } catch (error) {
    console.error('Error fetching curriculum:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch curriculum' },
      { status: 500 }
    )
  }
}
