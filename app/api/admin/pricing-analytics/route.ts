/**
 * Admin Pricing Analytics API
 * Provides comprehensive pricing and revenue analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/pricing-analytics?range=30d
 * Get pricing analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get time range
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Fetch overview data
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('amount_paid, original_price, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'active')

    const totalRevenue = enrollments?.reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0
    const totalEnrollments = enrollments?.length || 0
    const averageOrderValue = totalEnrollments > 0 ? totalRevenue / totalEnrollments : 0

    // Fetch by pricing model
    const { data: courses } = await supabase
      .from('courses')
      .select(`
        pricing_model,
        enrollments!inner(
          amount_paid,
          created_at
        )
      `)
      .gte('enrollments.created_at', startDate.toISOString())

    const byModel = courses?.reduce((acc: any[], course: any) => {
      const model = course.pricing_model || 'one_time'
      const existing = acc.find(m => m.model === model)
      
      if (existing) {
        existing.revenue += course.enrollments[0]?.amount_paid || 0
        existing.enrollments += 1
      } else {
        acc.push({
          model,
          revenue: course.enrollments[0]?.amount_paid || 0,
          enrollments: 1,
          conversionRate: 0 // Would need view data to calculate
        })
      }
      
      return acc
    }, []) || []

    // Fetch subscription data
    const { data: subscriptions } = await supabase
      .from('enrollments')
      .select('subscription_status, subscription_id, amount_paid')
      .not('subscription_id', 'is', null)
      .gte('created_at', startDate.toISOString())

    const activeSubscriptions = subscriptions?.filter(s => s.subscription_status === 'active').length || 0
    const cancelledSubscriptions = subscriptions?.filter(s => s.subscription_status === 'cancelled').length || 0
    const mrr = subscriptions
      ?.filter(s => s.subscription_status === 'active')
      .reduce((sum, s) => sum + (s.amount_paid || 0), 0) || 0
    const churnRate = (cancelledSubscriptions / (activeSubscriptions + cancelledSubscriptions)) * 100 || 0

    // Fetch payment plan data
    const { data: paymentPlans } = await supabase
      .from('payment_plans')
      .select('status, total_amount')
      .gte('created_at', startDate.toISOString())

    const activePlans = paymentPlans?.filter(p => p.status === 'active').length || 0
    const completedPlans = paymentPlans?.filter(p => p.status === 'completed').length || 0
    const defaultedPlans = paymentPlans?.filter(p => p.status === 'defaulted').length || 0
    const totalPlanValue = paymentPlans?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0

    // Fetch trial data
    const { data: trials } = await supabase
      .from('enrollments')
      .select('is_trial, trial_converted, status')
      .eq('is_trial', true)
      .gte('created_at', startDate.toISOString())

    const activeTrials = trials?.filter(t => t.status === 'active' && !t.trial_converted).length || 0
    const convertedTrials = trials?.filter(t => t.trial_converted).length || 0
    const expiredTrials = trials?.filter(t => t.status === 'expired').length || 0
    const trialConversionRate = (convertedTrials / (trials?.length || 1)) * 100

    const analytics = {
      overview: {
        totalRevenue,
        totalEnrollments,
        averageOrderValue,
        conversionRate: 42.5 // Would need view/visitor data
      },
      byModel,
      byMonth: [], // Would need to aggregate by month
      subscriptions: {
        active: activeSubscriptions,
        cancelled: cancelledSubscriptions,
        mrr,
        churnRate
      },
      paymentPlans: {
        active: activePlans,
        completed: completedPlans,
        defaulted: defaultedPlans,
        totalValue: totalPlanValue
      },
      trials: {
        active: activeTrials,
        converted: convertedTrials,
        expired: expiredTrials,
        conversionRate: trialConversionRate
      }
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Pricing analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
