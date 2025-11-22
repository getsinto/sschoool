import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/parent/performance - Get performance overview for all children
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'current' // current, semester, year

    // Mock performance data - replace with actual database queries
    const performanceData = {
      children: [
        {
          id: 'child_1',
          name: 'Alice Johnson',
          grade: 'Grade 10',
          photo: '/avatars/alice.jpg',
          overallGPA: 3.8,
          overallGrade: 88,
          trend: 'improving',
          trendPercentage: 5.2,
          courses: [
            {
              id: 'course_1',
              title: 'Advanced Mathematics',
              currentGrade: 92,
              letterGrade: 'A',
              credits: 4,
              teacher: 'Dr. Smith',
              assignments: {
                completed: 12,
                total: 15,
                avgScore: 90
              },
              quizzes: {
                completed: 8,
                total: 10,
                avgScore: 88
              },
              attendance: 95
            },
            {
              id: 'course_2',
              title: 'Physics',
              currentGrade: 85,
              letterGrade: 'B+',
              credits: 4,
              teacher: 'Prof. Johnson',
              assignments: {
                completed: 10,
                total: 12,
                avgScore: 85
              },
              quizzes: {
                completed: 6,
                total: 8,
                avgScore: 83
              },
              attendance: 98
            }
          ],
          strengths: ['Mathematics', 'Problem Solving', 'Critical Thinking'],
          areasForImprovement: ['Time Management', 'Class Participation'],
          recentAchievements: [
            {
              id: 'ach_1',
              title: 'Perfect Score',
              description: 'Scored 100% on Mathematics Quiz #5',
              date: '2024-01-19',
              icon: 'trophy'
            }
          ]
        },
        {
          id: 'child_2',
          name: 'Bob Johnson',
          grade: 'Grade 8',
          photo: '/avatars/bob.jpg',
          overallGPA: 3.2,
          overallGrade: 78,
          trend: 'stable',
          trendPercentage: 1.1,
          courses: [
            {
              id: 'course_3',
              title: 'English Literature',
              currentGrade: 82,
              letterGrade: 'B',
              credits: 3,
              teacher: 'Ms. Brown',
              assignments: {
                completed: 8,
                total: 10,
                avgScore: 80
              },
              quizzes: {
                completed: 5,
                total: 6,
                avgScore: 78
              },
              attendance: 90
            },
            {
              id: 'course_4',
              title: 'Mathematics',
              currentGrade: 70,
              letterGrade: 'C+',
              credits: 4,
              teacher: 'Mr. Davis',
              assignments: {
                completed: 7,
                total: 10,
                avgScore: 68
              },
              quizzes: {
                completed: 4,
                total: 6,
                avgScore: 65
              },
              attendance: 85
            }
          ],
          strengths: ['Creative Writing', 'Arts', 'Collaboration'],
          areasForImprovement: ['Mathematics', 'Attendance', 'Assignment Completion'],
          recentAchievements: [
            {
              id: 'ach_2',
              title: 'Essay Award',
              description: 'Won best essay in English class',
              date: '2024-01-15',
              icon: 'award'
            }
          ]
        }
      ],
      comparisonData: {
        averageGPA: 3.5,
        topPerformer: {
          childId: 'child_1',
          childName: 'Alice Johnson',
          gpa: 3.8
        },
        needsAttention: [
          {
            childId: 'child_2',
            childName: 'Bob Johnson',
            course: 'Mathematics',
            grade: 70,
            reason: 'Below expected performance'
          }
        ]
      },
      recommendations: [
        {
          childId: 'child_2',
          childName: 'Bob Johnson',
          type: 'tutoring',
          subject: 'Mathematics',
          priority: 'high',
          message: 'Consider additional tutoring support for Mathematics'
        },
        {
          childId: 'child_2',
          childName: 'Bob Johnson',
          type: 'attendance',
          priority: 'medium',
          message: 'Improve attendance consistency'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: performanceData
    })
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}
