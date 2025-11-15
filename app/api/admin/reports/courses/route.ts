import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '30days'
    
    // Mock data - replace with actual database queries
    const courses = [
      {
        id: '1',
        courseName: 'Mathematics Grade 10',
        totalEnrollments: 245,
        completionRate: 78.5,
        averageRating: 4.6,
        revenueGenerated: 24500,
        watchTime: 1250,
        dropOffRate: 15.2,
        engagementScore: 85
      },
      {
        id: '2',
        courseName: 'Physics Grade 11',
        totalEnrollments: 189,
        completionRate: 72.3,
        averageRating: 4.4,
        revenueGenerated: 18900,
        watchTime: 980,
        dropOffRate: 18.5,
        engagementScore: 78
      }
    ]

    return NextResponse.json({ courses, dateRange })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch course analytics' },
      { status: 500 }
    )
  }
}
