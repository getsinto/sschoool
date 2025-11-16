import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Mock dashboard data
    const dashboardData = {
      stats: {
        totalUsers: {
          total: 1250,
          students: 980,
          teachers: 245,
          parents: 25,
          change: 12.5,
          trend: 'up' as const
        },
        totalRevenue: {
          current: 485750,
          previous: 425000,
          change: 14.3,
          trend: 'up' as const
        },
        activeCourses: {
          total: 156,
          change: 8.2,
          trend: 'up' as const
        },
        pendingApprovals: {
          total: 23,
          change: -15.5,
          trend: 'down' as const
        },
        newRegistrations: {
          total: 45,
          change: 22.3,
          trend: 'up' as const
        },
        liveClassesToday: {
          total: 12,
          change: 5.8,
          trend: 'up' as const
        },
        supportTickets: {
          total: 8,
          change: -12.5,
          trend: 'down' as const
        },
        platformUsage: {
          total: 2450,
          change: 18.7,
          trend: 'up' as const
        }
      },
      revenueData: [
        { month: 'Jan', revenue: 35000 },
        { month: 'Feb', revenue: 38000 },
        { month: 'Mar', revenue: 42000 },
        { month: 'Apr', revenue: 39000 },
        { month: 'May', revenue: 45000 },
        { month: 'Jun', revenue: 48000 },
        { month: 'Jul', revenue: 52000 },
        { month: 'Aug', revenue: 49000 },
        { month: 'Sep', revenue: 55000 },
        { month: 'Oct', revenue: 58000 },
        { month: 'Nov', revenue: 62000 },
        { month: 'Dec', revenue: 65000 }
      ],
      userGrowthData: [
        { month: 'Jul', users: 850 },
        { month: 'Aug', users: 920 },
        { month: 'Sep', users: 1050 },
        { month: 'Oct', users: 1120 },
        { month: 'Nov', users: 1180 },
        { month: 'Dec', users: 1250 }
      ],
      courseEnrollmentData: [
        { course: 'Mathematics Grade 10', enrollments: 245 },
        { course: 'Physics Grade 11', enrollments: 189 },
        { course: 'Chemistry Grade 9', enrollments: 167 },
        { course: 'Biology Grade 12', enrollments: 156 },
        { course: 'English Literature', enrollments: 142 }
      ],
      recentActivities: [
        {
          id: 1,
          type: 'registration',
          message: 'New student registered: John Doe',
          time: '2 minutes ago',
          icon: 'UserPlus',
          color: 'text-blue-600'
        },
        {
          id: 2,
          type: 'payment',
          message: 'Payment received: $299 for Mathematics Course',
          time: '15 minutes ago',
          icon: 'DollarSign',
          color: 'text-green-600'
        },
        {
          id: 3,
          type: 'enrollment',
          message: 'Sarah Johnson enrolled in Physics Grade 11',
          time: '1 hour ago',
          icon: 'BookOpen',
          color: 'text-purple-600'
        },
        {
          id: 4,
          type: 'class',
          message: 'Live class started: Chemistry Lab Session',
          time: '2 hours ago',
          icon: 'Video',
          color: 'text-red-600'
        },
        {
          id: 5,
          type: 'support',
          message: 'New support ticket: Login Issue',
          time: '3 hours ago',
          icon: 'MessageSquare',
          color: 'text-yellow-600'
        }
      ]
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
