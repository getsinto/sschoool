import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const teachers = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        coursesCreated: 8,
        studentsTaught: 245,
        averageRating: 4.8,
        liveClassesConducted: 32,
        responseTime: 2.5,
        gradingTime: 24
      },
      {
        id: '2',
        name: 'Prof. Michael Chen',
        coursesCreated: 6,
        studentsTaught: 189,
        averageRating: 4.6,
        liveClassesConducted: 28,
        responseTime: 3.2,
        gradingTime: 36
      }
    ]

    return NextResponse.json({ teachers })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teacher performance' },
      { status: 500 }
    )
  }
}
