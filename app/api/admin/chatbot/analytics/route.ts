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

    const { count: totalConversations } = await supabase
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true })

    const { count: recentConversations } = await supabase
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .gte('created_at', startDate.toISOString())

    const totalMessages = messages?.length || 0
    const userMessages = messages?.filter((m: any) => m.role === 'user').length || 0
    const botMessages = messages?.filter((m: any) => m.role === 'assistant').length || 0

    const { data: analytics } = await supabase
      .from('chatbot_analytics')
      .select('*')
      .gte('created_at', startDate.toISOString())

    const totalQueries = analytics?.length || 0
    const resolvedQueries = analytics?.filter((a: any) => a.resolved).length || 0
    const escalatedQueries = analytics?.filter((a: any) => a.escalated).length || 0
    const avgConfidence = analytics && analytics.length > 0
      ? analytics.reduce((sum: number, a: any) => sum + (a.confidence_score || 0), 0) / analytics.length
      : 0

    const intentCounts = (analytics || []).reduce((acc: any, item: any) => {
      if (item.intent) {
        acc[item.intent] = (acc[item.intent] || 0) + 1
      }
      return acc
    }, {})

    const topIntents = Object.entries(intentCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 10)
      .map(([intent, count]) => ({ intent, count }))

    const { data: failedQueries } = await supabase
      .from('chatbot_analytics')
      .select('query, created_at')
      .eq('resolved', false)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: feedback } = await supabase
      .from('chat_messages')
      .select('feedback_rating')
      .not('feedback_rating', 'is', null)
      .gte('created_at', startDate.toISOString())

    const avgRating = feedback && feedback.length > 0
      ? feedback.reduce((sum: number, f: any) => sum + f.feedback_rating, 0) / feedback.length
      : 0

    const ratingDistribution = (feedback || []).reduce((acc: any, f: any) => {
      const rating = f.feedback_rating
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {})

    const { data: dailyData } = await supabase
      .from('chat_conversations')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    const dailyCounts: any = {}
    ;(dailyData || []).forEach((conv: any) => {
      const date = new Date(conv.created_at).toISOString().split('T')[0]
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })

    const { data: popularFAQs } = await supabase
      .from('faqs')
      .select('id, question, usage_count')
      .order('usage_count', { ascending: false })
      .limit(10)

    const resolutionRate = totalQueries > 0 ? (resolvedQueries / totalQueries) * 100 : 0
    const escalationRate = totalQueries > 0 ? (escalatedQueries / totalQueries) * 100 : 0

    return NextResponse.json({
      overview: {
        total_conversations: totalConversations || 0,
        recent_conversations: recentConversations || 0,
        total_messages: totalMessages,
        user_messages: userMessages,
        bot_messages: botMessages,
        total_queries: totalQueries,
        resolved_queries: resolvedQueries,
        escalated_queries: escalatedQueries
      },
      metrics: {
        resolution_rate: Math.round(resolutionRate * 10) / 10,
        escalation_rate: Math.round(escalationRate * 10) / 10,
        avg_confidence: Math.round(avgConfidence * 100) / 100,
        avg_rating: Math.round(avgRating * 10) / 10,
        total_feedback: feedback?.length || 0
      },
      top_intents: topIntents,
      failed_queries: failedQueries || [],
      rating_distribution: ratingDistribution,
      daily_conversations: Object.entries(dailyCounts).map(([date, count]) => ({
        date,
        count
      })),
      popular_faqs: popularFAQs || [],
      period: parseInt(period)
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const {
      conversation_id,
      query,
      intent,
      confidence_score,
      resolved,
      escalated,
      response_time_ms
    } = await request.json()

    const { data: analytics, error: analyticsError } = await supabase
      .from('chatbot_analytics')
      .insert({
        conversation_id,
        query,
        intent,
        confidence_score,
        resolved: resolved || false,
        escalated: escalated || false,
        response_time_ms: response_time_ms || 0
      })
      .select('*')
      .single()

    if (analyticsError) {
      console.error('Analytics insert error:', analyticsError)
      throw analyticsError
    }

    return NextResponse.json({
      analytics,
      success: true
    })
  } catch (error) {
    console.error('Analytics insert error:', error)
    return NextResponse.json(
      { error: 'Failed to record analytics' },
      { status: 500 }
    )
  }
}
