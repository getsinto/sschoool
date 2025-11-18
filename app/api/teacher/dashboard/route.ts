import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock data - in production, this would come from Supabase
const mockDashboardData = {
  stats: {
    totalCourses: 12,
    totalStudents: 245,
    upcomingClasses: 3,
    pendingGrading: 18,
    averageRating: 4.8,
    teachingHours: 156,
    monthlyEarnings: 2850,
    activeEnrollments: 89
  },
  courses: [
    {
      id: '1',
      name: 'Advanced Mathematics',
      enrollments: 45,
      completionRate: 78,
      averageRating: 4.9,
      lastUpdated: '2 days ago',
      status: 'active',
      revenue: 1250
    },
    {
      id: '2',
      name: 'Physics Fundamentals',
      enrollments: 38,
      completionRate: 82,
      averageRating: 4.7,
      lastUpdated: '1 week ago',
      status: 'active',
      revenue: 980
    },
    {
      id: '3',
      name: 'English Literature',
      enrollments: 52,
      completionRate: 65,
      averageRating: 4.6,
      lastUpdated: '3 days ago',
      status: 'active',
      revenue: 1560
    },
    {
      id: '4',
      name: 'Chemistry Basics',
      enrollments: 30,
      completionRate: 70,
      averageRating: 4.5,
      lastUpdated: '5 days ago',
      status: 'active',
      revenue: 750
    }
  ],
  upcomingClasses: [
    {
      id: 1,
      title: 'Advanced Mathematics',
      course: 'Grade 10 Mathematics',
      dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      duration: 60,
      studentsCount: 25,
      canJoin: false,
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: 2,
      title: 'Physics Lab Session',
      course: 'Grade 9 Physics',
      dateTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      duration: 90,
      studentsCount: 18,
      canJoin: false,
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 3,
      title: 'English Literature Discussion',
      course: 'Grade 8 English',
      dateTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
      duration: 45,
      studentsCount: 22,
      canJoin: false,
      meetingLink: 'https://zoom.us/j/987654321'
    },
    {
      id: 4,
      title: 'Chemistry Basics',
      course: 'Grade 9 Chemistry',
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 75,
      studentsCount: 20,
      canJoin: false,
      meetingLink: 'https://meet.google.com/xyz-uvwx-rst'
    },
    {
      id: 5,
      title: 'History Review',
      course: 'Grade 8 History',
      dateTime: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 50,
      studentsCount: 28,
      canJoin: false,
      meetingLink: 'https://zoom.us/j/456789123'
    }
  ],
  recentActivity: [
    {
      id: 1,
      type: 'enrollment',
      message: 'Sarah Johnson enrolled in Advanced Mathematics',
      time: '2 minutes ago',
      icon: 'UserCheck',
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'submission',
      message: 'New quiz submission from Michael Chen',
      time: '15 minutes ago',
      icon: 'FileText',
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'message',
      message: 'Emma Davis sent you a message',
      time: '1 hour ago',
      icon: 'MessageSquare',
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'review',
      message: 'New 5-star review for Physics Fundamentals',
      time: '2 hours ago',
      icon: 'Star',
      color: 'text-yellow-600'
    },
    {
      id: 5,
      type: 'assignment',
      message: 'Assignment submitted by Alex Thompson',
      time: '3 hours ago',
      icon: 'ClipboardCheck',
      color: 'text-indigo-600'
    },
    {
      id: 6,
      type: 'enrollment',
      message: 'David Wilson enrolled in English Literature',
      time: '4 hours ago',
      icon: 'UserCheck',
      color: 'text-green-600'
    }
  ],
  studentsAtRisk: [
    {
      id: 1,
      name: 'Alex Thompson',
      avatar: '/avatars/alex.jpg',
      course: 'Grade 9 Mathematics',
      issue: 'Low completion rate (35%)',
      lastActive: '5 days ago',
      riskLevel: 'high',
      completionRate: 35
    },
    {
      id: 2,
      name: 'Jessica Lee',
      avatar: '/avatars/jessica.jpg',
      course: 'Grade 10 Physics',
      issue: 'Poor quiz scores (avg 45%)',
      lastActive: '2 days ago',
      riskLevel: 'medium',
      completionRate: 60
    },
    {
      id: 3,
      name: 'David Wilson',
      avatar: '/avatars/david.jpg',
      course: 'Grade 8 English',
      issue: 'Inactive for 8 days',
      lastActive: '8 days ago',
      riskLevel: 'high',
      completionRate: 25
    }
  ]
}

// GET /api/teacher/dashboard - Get teacher dashboard data
export async function GET(request: NextRequest) {
  try {
    // TODO: Get teacher ID from authenticated session
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // TODO: Fetch real data from Supabase
    // const { data: stats } = await supabase
    //   .from('teacher_stats')
    //   .select('*')
    //   .eq('teacher_id', user.id)
    //   .single()

    // For now, return mock data
    return NextResponse.json(mockDashboardData, { status: 200 })
  } catch (error) {
    console.error('Error fetching teacher dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
