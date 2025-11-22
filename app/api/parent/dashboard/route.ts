import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/parent/dashboard - Get parent dashboard overview
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const childId = searchParams.get('childId')

    // Mock dashboard data - replace with actual database queries
    const dashboardData = {
      parent: {
        id: 'parent_1',
        name: 'John Doe',
        email: 'parent@example.com',
        phone: '+1234567890'
      },
      children: [
        {
          id: 'child_1',
          name: 'Alice Johnson',
          grade: 'Grade 10',
          photo: '/avatars/alice.jpg',
          activeEnrollments: 4,
          overallGPA: 3.8,
          attendance: 95
        },
        {
          id: 'child_2',
          name: 'Bob Johnson',
          grade: 'Grade 8',
          photo: '/avatars/bob.jpg',
          activeEnrollments: 3,
          overallGPA: 3.2,
          attendance: 88
        }
      ],
      quickStats: {
        totalChildren: 2,
        activeEnrollments: 7,
        upcomingClasses: 5,
        pendingPayments: 1,
        unreadMessages: 3
      },
      upcomingClasses: [
        {
          id: 'class_1',
          childId: 'child_1',
          childName: 'Alice Johnson',
          title: 'Advanced Mathematics',
          teacher: 'Dr. Smith',
          startTime: '2024-01-20T10:00:00Z',
          duration: 60,
          type: 'live',
          meetingUrl: 'https://zoom.us/j/123456789'
        },
        {
          id: 'class_2',
          childId: 'child_2',
          childName: 'Bob Johnson',
          title: 'English Literature',
          teacher: 'Ms. Brown',
          startTime: '2024-01-20T14:00:00Z',
          duration: 45,
          type: 'live',
          meetingUrl: 'https://meet.google.com/abc-defg-hij'
        }
      ],
      recentActivity: [
        {
          id: 'activity_1',
          childId: 'child_1',
          childName: 'Alice Johnson',
          type: 'grade',
          title: 'Quiz Grade Posted',
          description: 'Mathematics Quiz #5',
          score: 92,
          timestamp: '2024-01-19T15:30:00Z',
          status: 'success'
        },
        {
          id: 'activity_2',
          childId: 'child_2',
          childName: 'Bob Johnson',
          type: 'assignment',
          title: 'Assignment Submitted',
          description: 'History Essay',
          timestamp: '2024-01-19T12:00:00Z',
          status: 'info'
        },
        {
          id: 'activity_3',
          childId: 'child_1',
          childName: 'Alice Johnson',
          type: 'attendance',
          title: 'Class Attended',
          description: 'Physics Lab Session',
          timestamp: '2024-01-19T09:00:00Z',
          status: 'success'
        }
      ],
      alerts: [
        {
          id: 'alert_1',
          childId: 'child_2',
          childName: 'Bob Johnson',
          type: 'grade',
          severity: 'warning',
          title: 'Low Grade Alert',
          message: 'Bob scored 65% on Mathematics Quiz #3',
          course: 'Mathematics',
          actionUrl: '/parent/performance?childId=child_2',
          timestamp: '2024-01-18T10:00:00Z'
        },
        {
          id: 'alert_2',
          childId: 'child_2',
          childName: 'Bob Johnson',
          type: 'attendance',
          severity: 'info',
          title: 'Attendance Notice',
          message: 'Bob missed 2 classes this week',
          course: 'Science',
          actionUrl: '/parent/attendance?childId=child_2',
          timestamp: '2024-01-17T14:00:00Z'
        }
      ],
      pendingPayments: [
        {
          id: 'payment_1',
          childId: 'child_1',
          childName: 'Alice Johnson',
          course: 'Advanced Chemistry',
          amount: 299.99,
          dueDate: '2024-01-25T00:00:00Z',
          status: 'pending'
        }
      ]
    }

    // If specific child requested, filter data
    if (childId) {
      const child = dashboardData.children.find(c => c.id === childId)
      if (!child) {
        return NextResponse.json(
          { success: false, error: 'Child not found' },
          { status: 404 }
        )
      }

      const filteredData = {
        ...dashboardData,
        children: [child],
        upcomingClasses: dashboardData.upcomingClasses.filter(c => c.childId === childId),
        recentActivity: dashboardData.recentActivity.filter(a => a.childId === childId),
        alerts: dashboardData.alerts.filter(a => a.childId === childId),
        pendingPayments: dashboardData.pendingPayments.filter(p => p.childId === childId)
      }

      return NextResponse.json({
        success: true,
        data: filteredData
      })
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })
  } catch (error) {
    console.error('Error fetching parent dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
