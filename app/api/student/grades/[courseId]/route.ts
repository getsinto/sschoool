import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId

    // Mock data - replace with actual database queries
    const mockCourseGrades = {
      course: {
        id: courseId,
        name: 'Advanced Mathematics',
        instructor: 'Dr. Smith',
        thumbnail: '/course-math.jpg'
      },
      overall: {
        grade: 92,
        letterGrade: 'A-',
        gpa: 3.7,
        rank: 5,
        totalStudents: 30
      },
      breakdown: {
        quizzes: { weight: 30, earned: 88, possible: 100 },
        assignments: { weight: 40, earned: 95, possible: 100 },
        participation: { weight: 20, earned: 90, possible: 100 },
        final: { weight: 10, earned: 0, possible: 100 }
      },
      grades: [
        {
          id: '1',
          type: 'quiz',
          title: 'Quiz 3: Calculus',
          score: 18,
          maxScore: 20,
          percentage: 90,
          date: '2024-01-15',
          feedback: 'Excellent work!'
        },
        {
          id: '2',
          type: 'assignment',
          title: 'Assignment 2: Problem Set',
          score: 95,
          maxScore: 100,
          percentage: 95,
          date: '2024-01-12',
          feedback: 'Great problem-solving approach'
        },
        {
          id: '3',
          type: 'quiz',
          title: 'Quiz 2: Algebra',
          score: 16,
          maxScore: 20,
          percentage: 80,
          date: '2024-01-08',
          feedback: 'Review quadratic equations'
        }
      ],
      trends: [
        { week: 'Week 1', average: 85 },
        { week: 'Week 2', average: 88 },
        { week: 'Week 3', average: 90 },
        { week: 'Week 4', average: 92 }
      ]
    }

    return NextResponse.json({
      success: true,
      data: mockCourseGrades
    })
  } catch (error) {
    console.error('Error fetching course grades:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course grades' },
      { status: 500 }
    )
  }
}
