import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user and verify admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total users count by role
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: students } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')

    const { count: teachers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'teacher')

    const { count: parents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'parent')

    // Get active courses count
    const { count: activeCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Get pending approvals (users with verification_status = 'pending')
    const { count: pendingApprovals } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending')

    // Get new registrations this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { count: newRegistrations } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString())

    // Get live classes today
    const today = new Date().toISOString().split('T')[0]
    const { count: liveClassesToday } = await supabase
      .from('live_classes')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', `${today}T00:00:00`)
      .lt('scheduled_at', `${today}T23:59:59`)

    // Get open support tickets
    const { count: supportTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')

    // Get revenue data (last 12 months)
    const revenueData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()
      
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)

      const total = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      
      revenueData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: total
      })
    }

    // Get user growth data (last 6 months)
    const userGrowthData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()
      
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', monthEnd)

      userGrowthData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        users: count || 0
      })
    }

    // Get top course enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id, courses(title)')
      .limit(10)

    const enrollmentCounts: Record<string, { title: string; count: number }> = {}
    enrollments?.forEach((e: any) => {
      const courseId = e.course_id
      const title = e.courses?.title || 'Unknown Course'
      if (!enrollmentCounts[courseId]) {
        enrollmentCounts[courseId] = { title, count: 0 }
      }
      enrollmentCounts[courseId].count++
    })

    const courseEnrollmentData = Object.values(enrollmentCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(c => ({ course: c.title, enrollments: c.count }))

    // Get recent activities
    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    const recentActivities = recentProfiles?.map((p, i) => ({
      id: i + 1,
      type: 'registration',
      message: `New user ${p.full_name} registered`,
      time: getTimeAgo(new Date(p.created_at)),
      icon: 'UserPlus',
      color: 'text-green-600'
    })) || []

    // Calculate current month revenue
    const currentMonth = new Date()
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString()
    
    const { data: currentMonthPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', monthStart)

    const currentRevenue = currentMonthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    // Calculate previous month revenue for comparison
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const prevMonthStart = prevMonth.toISOString()
    const prevMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0, 23, 59, 59).toISOString()
    
    const { data: prevMonthPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', prevMonthStart)
      .lte('created_at', prevMonthEnd)

    const previousRevenue = prevMonthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 1

    const revenueChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100

    return NextResponse.json({
      stats: {
        totalUsers: {
          total: totalUsers || 0,
          students: students || 0,
          teachers: teachers || 0,
          parents: parents || 0,
          change: 0, // Calculate based on previous period if needed
          trend: 'up'
        },
        totalRevenue: {
          current: currentRevenue,
          previous: previousRevenue,
          change: revenueChange,
          trend: revenueChange >= 0 ? 'up' : 'down'
        },
        activeCourses: {
          total: activeCourses || 0,
          change: 0,
          trend: 'up'
        },
        pendingApprovals: {
          total: pendingApprovals || 0,
          change: 0,
          trend: 'down'
        },
        newRegistrations: {
          total: newRegistrations || 0,
          change: 0,
          trend: 'up'
        },
        liveClassesToday: {
          total: liveClassesToday || 0,
          change: 0,
          trend: 'up'
        },
        supportTickets: {
          total: supportTickets || 0,
          change: 0,
          trend: 'down'
        },
        platformUsage: {
          total: 0, // Calculate based on session data if available
          change: 0,
          trend: 'up'
        }
      },
      revenueData,
      userGrowthData,
      courseEnrollmentData,
      recentActivities
    })

  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return `${seconds} seconds ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}
