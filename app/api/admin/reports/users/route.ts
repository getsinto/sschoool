import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30days'
    
    const data = {
      totalUsers: 1250,
      activeUsers: 892,
      newUsers: 145,
      churnRate: 8.5,
      avgSessionDuration: 24,
      retentionRate: 78.5,
      dailyActiveUsers: 456,
      weeklyActiveUsers: 892,
      monthlyActiveUsers: 1120,
      userGrowth: [
        { date: '2024-01-01', users: 1000 },
        { date: '2024-01-15', users: 1150 },
        { date: '2024-01-30', users: 1250 }
      ]
    }

    return NextResponse.json({ data, range })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    )
  }
}
