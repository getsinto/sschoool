import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data - replace with actual database queries
    const mockGradesData = {
      overall: {
        gpa: 3.7,
        average: 87.5,
        totalPoints: 875,
        possiblePoints: 1000
      },
      courses: [
        {
          id: 'math-101',
          name: 'Advanced Mathematics',
          instructor: 'Dr. Smith',
          thumbnail: '/course-math.jpg',
          grade: 92,
          letterGrade: 'A-',
          breakdown: {
            quizzes: 88,
            assignments: 95,
            participation: 90
          },
          recentGrades: [
            {
              title: 'Quiz 3: Calculus',
              score: 18,
              maxScore: 20,
              percentage: 90,
              date: '2024-01-15'
            },
            {
              title: 'Assignment 2: Problem Set',
              score: 95,
              maxScore: 100,
              percentage: 95,
              date: '2024-01-12'
            },
            {
              title: 'Quiz 2: Algebra',
              score: 16,
              maxScore: 20,
              percentage: 80,
              date: '2024-01-08'
            }
          ]
        },
        {
          id: 'phys-201',
          name: 'Physics',
          instructor: 'Prof. Johnson',
          thumbnail: '/course-physics.jpg',
          grade: 85,
          letterGrade: 'B+',
          breakdown: {
            quizzes: 82,
            assignments: 88,
            participation: 85
          },
          recentGrades: [
            {
              title: 'Lab Report 2',
              score: 132,
              maxScore: 150,
              percentage: 88,
              date: '2024-01-14'
            },
            {
              title: 'Quiz 4: Mechanics',
              score: 24,
              maxScore: 30,
              percentage: 80,
              date: '2024-01-10'
            },
            {
              title: 'Assignment 3: Problems',
              score: 85,
              maxScore: 100,
              percentage: 85,
              date: '2024-01-06'
            }
          ]
        },
        {
          id: 'hist-101',
          name: 'World History',
          instructor: 'Dr. Williams',
          thumbnail: '/course-history.jpg',
          grade: 78,
          letterGrade: 'C+',
          breakdown: {
            quizzes: 75,
            assignments: 82,
            participation: 78
          },
          recentGrades: [
            {
              title: 'Essay: WWI Causes',
              score: 164,
              maxScore: 200,
              percentage: 82,
              date: '2024-01-13'
            },
            {
              title: 'Quiz 3: Industrial Revolution',
              score: 22,
              maxScore: 30,
              percentage: 73,
              date: '2024-01-09'
            },
            {
              title: 'Assignment 2: Timeline',
              score: 78,
              maxScore: 100,
              percentage: 78,
              date: '2024-01-05'
            }
          ]
        }
      ],
      trends: [
        { month: 'Sep', average: 82 },
        { month: 'Oct', average: 85 },
        { month: 'Nov', average: 87 },
        { month: 'Dec', average: 88 },
        { month: 'Jan', average: 87 }
      ],
      insights: {
        strengths: [
          'Excellent performance in Mathematics',
          'Consistent assignment submissions',
          'Strong problem-solving skills'
        ],
        improvements: [
          'Focus more on History essay writing',
          'Improve quiz preparation in Physics',
          'Increase class participation'
        ],
        recommendations: [
          'Schedule regular study sessions for History',
          'Use practice problems for Physics concepts',
          'Join study groups for better understanding'
        ]
      }
    }

    return NextResponse.json({
      success: true,
      data: mockGradesData
    })
  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grades' },
      { status: 500 }
    )
  }
}
