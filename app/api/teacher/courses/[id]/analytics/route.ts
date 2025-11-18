import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock analytics data
const mockAnalytics = {
  '1': {
    enrollmentOverTime: [
      { month: 'Aug', enrollments: 45 },
      { month: 'Sep', enrollments: 62 },
      { month: 'Oct', enrollments: 78 },
      { month: 'Nov', enrollments: 95 },
      { month: 'Dec', enrollments: 128 },
      { month: 'Jan', enrollments: 245 }
    ],
    completionFunnel: [
      { section: 'Section 1', completed: 245, percentage: 100 },
      { section: 'Section 2', completed: 238, percentage: 97 },
      { section: 'Section 3', completed: 225, percentage: 92 },
      { section: 'Section 4', completed: 210, percentage: 86 },
      { section: 'Section 5', completed: 198, percentage: 81 },
      { section: 'Section 6', completed: 185, percentage: 76 },
      { section: 'Section 7', completed: 175, percentage: 71 },
      { section: 'Section 8', completed: 165, percentage: 67 }
    ],
    lessonEngagement: [
      { lesson: 'Introduction to Algebra', watchTime: 245, completionRate: 98, avgDuration: '12 min' },
      { lesson: 'Linear Equations', watchTime: 238, completionRate: 95, avgDuration: '18 min' },
      { lesson: 'Quadratic Functions', watchTime: 225, completionRate: 92, avgDuration: '22 min' },
      { lesson: 'Polynomials', watchTime: 210, completionRate: 88, avgDuration: '20 min' },
      { lesson: 'Factoring', watchTime: 198, completionRate: 85, avgDuration: '25 min' }
    ],
    quizPerformance: {
      totalQuizzes: 12,
      averageScore: 85,
      passRate: 92,
      topPerformers: 45,
      needsHelp: 18,
      scoreDistribution: [
        { range: '90-100', count: 98 },
        { range: '80-89', count: 75 },
        { range: '70-79', count: 45 },
        { range: '60-69', count: 20 },
        { range: '0-59', count: 7 }
      ]
    },
    dropOffPoints: [
      { lesson: 'Advanced Factoring', dropRate: 15, students: 37 },
      { lesson: 'Complex Numbers', dropRate: 12, students: 29 },
      { lesson: 'Rational Expressions', dropRate: 10, students: 25 }
    ],
    studentFeedback: {
      totalReviews: 156,
      averageRating: 4.8,
      ratingDistribution: {
        5: 78,
        4: 52,
        3: 18,
        2: 6,
        1: 2
      },
      commonThemes: [
        { theme: 'Clear explanations', mentions: 89 },
        { theme: 'Good examples', mentions: 76 },
        { theme: 'Helpful quizzes', mentions: 65 },
        { theme: 'Well structured', mentions: 58 }
      ]
    },
    revenueMetrics: {
      totalRevenue: 12450,
      monthlyRevenue: [
        { month: 'Aug', revenue: 2250 },
        { month: 'Sep', revenue: 3100 },
        { month: 'Oct', revenue: 3900 },
        { month: 'Nov', revenue: 4750 },
        { month: 'Dec', revenue: 6400 },
        { month: 'Jan', revenue: 12450 }
      ],
      averageRevenuePerStudent: 50.82,
      refundRate: 2.4
    }
  }
}

// GET /api/teacher/courses/[id]/analytics - Get course analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const { searchParams } = new URL(request.url)
    
    const timeRange = searchParams.get('timeRange') || '6months'
    const metrics = searchParams.get('metrics')?.split(',') || ['all']

    const analytics = mockAnalytics[courseId as keyof typeof mockAnalytics]

    if (!analytics) {
      return NextResponse.json(
        { error: 'Analytics not found' },
        { status: 404 }
      )
    }

    // Filter metrics if specific ones requested
    let response = analytics
    if (metrics[0] !== 'all') {
      response = Object.keys(analytics)
        .filter(key => metrics.includes(key))
        .reduce((obj, key) => {
          obj[key] = analytics[key as keyof typeof analytics]
          return obj
        }, {} as any)
    }

    return NextResponse.json({
      analytics: response,
      timeRange,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// POST /api/teacher/courses/[id]/analytics - Export analytics
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { format, metrics } = body

    if (!format || !['csv', 'pdf', 'excel'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid export format' },
        { status: 400 }
      )
    }

    // In production, generate actual export file
    return NextResponse.json({
      message: 'Export generated successfully',
      downloadUrl: `/exports/analytics-${params.id}-${Date.now()}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    )
  }
}
