import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    const { count: totalTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })

    const { count: openTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')

    const { count: inProgressTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress')

    const { count: resolvedTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')

    const { count: closedTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'closed')

    const { count: recentTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    const { data: categoryStats } = await supabase
      .from('support_tickets')
      .select('category')
      .gte('created_at', startDate.toISOString())

    const categoryCounts = (categoryStats || []).reduce((acc: any, ticket: any) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1
      return acc
    }, {})

    const { data: priorityStats } = await supabase
      .from('support_tickets')
      .select('priority')
      .neq('status', 'closed')

    const priorityCounts = (priorityStats || []).reduce((acc: any, ticket: any) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1
      return acc
    }, {})

    const { data: responseTimeData } = await supabase
      .from('support_tickets')
      .select('created_at, updated_at, status')
      .neq('status', 'open')
      .gte('created_at', startDate.toISOString())
      .limit(100)

    let avgResponseTime = 0
    if (responseTimeData && responseTimeData.length > 0) {
      const responseTimes = responseTimeData.map((ticket: any) => {
        const created = new Date(ticket.created_at).getTime()
        const updated = new Date(ticket.updated_at).getTime()
        return (updated - created) / (1000 * 60 * 60) // hours
      })
      avgResponseTime = responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length
    }

    const { data: resolutionData } = await supabase
      .from('support_tickets')
      .select('created_at, closed_at')
      .eq('status', 'closed')
      .not('closed_at', 'is', null)
      .gte('created_at', startDate.toISOString())
      .limit(100)

    let avgResolutionTime = 0
    if (resolutionData && resolutionData.length > 0) {
      const resolutionTimes = resolutionData.map((ticket: any) => {
        const created = new Date(ticket.created_at).getTime()
        const closed = new Date(ticket.closed_at).getTime()
        return (closed - created) / (1000 * 60 * 60) // hours
      })
      avgResolutionTime = resolutionTimes.reduce((a: number, b: number) => a + b, 0) / resolutionTimes.length
    }

    const { data: dailyStats } = await supabase
      .from('support_tickets')
      .select('created_at, status')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    const dailyCounts: any = {}
    ;(dailyStats || []).forEach((ticket: any) => {
      const date = new Date(ticket.created_at).toISOString().split('T')[0]
      if (!dailyCounts[date]) {
        dailyCounts[date] = { date, created: 0, resolved: 0 }
      }
      dailyCounts[date].created++
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        dailyCounts[date].resolved++
      }
    })

    const resolutionRate = totalTickets && totalTickets > 0
      ? ((resolvedTickets || 0) + (closedTickets || 0)) / totalTickets * 100
      : 0

    return NextResponse.json({
      overview: {
        total: totalTickets || 0,
        open: openTickets || 0,
        in_progress: inProgressTickets || 0,
        resolved: resolvedTickets || 0,
        closed: closedTickets || 0,
        recent: recentTickets || 0
      },
      metrics: {
        avg_response_time_hours: Math.round(avgResponseTime * 10) / 10,
        avg_resolution_time_hours: Math.round(avgResolutionTime * 10) / 10,
        resolution_rate: Math.round(resolutionRate * 10) / 10
      },
      by_category: categoryCounts,
      by_priority: priorityCounts,
      daily_trend: Object.values(dailyCounts),
      period: parseInt(period)
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
