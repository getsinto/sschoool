/**
 * Subscription Payment API
 * Handles subscription creation and management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import subscriptionService from '@/lib/payments/subscriptions'

/**
 * POST /api/payments/subscription
 * Create a new subscription
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      courseId,
      subscriptionType,
      subscriptionPrice,
      currency,
      autoRenewal,
      freeTrialDays,
      trialRequiresCard,
      metadata
    } = body

    // Validate required fields
    if (!courseId || !subscriptionType || !subscriptionPrice || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate subscription type
    if (!['monthly', 'quarterly', 'yearly'].includes(subscriptionType)) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      )
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, pricing_model')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single()

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create subscription
    const result = await subscriptionService.createSubscription({
      courseId,
      studentId: user.id,
      subscriptionType,
      subscriptionPrice: parseFloat(subscriptionPrice),
      currency,
      autoRenewal: autoRenewal !== false,
      freeTrialDays: freeTrialDays ? parseInt(freeTrialDays) : undefined,
      trialRequiresCard: trialRequiresCard === true,
      metadata
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriptionId: result.subscriptionId,
      enrollmentId: result.enrollmentId,
      clientSecret: result.clientSecret,
      trialEndsAt: result.trialEndsAt
    })

  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/payments/subscription?subscriptionId=xxx&enrollmentId=xxx
 * Cancel a subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const subscriptionId = searchParams.get('subscriptionId')
    const enrollmentId = searchParams.get('enrollmentId')
    const reason = searchParams.get('reason')
    const cancelAtPeriodEnd = searchParams.get('cancelAtPeriodEnd') === 'true'

    if (!subscriptionId || !enrollmentId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId or enrollmentId' },
        { status: 400 }
      )
    }

    // Verify enrollment belongs to user
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('id', enrollmentId)
      .single()

    if (enrollmentError || !enrollment || enrollment.student_id !== user.id) {
      return NextResponse.json(
        { error: 'Enrollment not found or unauthorized' },
        { status: 404 }
      )
    }

    // Cancel subscription
    const result = await subscriptionService.cancelSubscription({
      subscriptionId,
      enrollmentId,
      reason: reason || undefined,
      cancelAtPeriodEnd
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to cancel subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be cancelled at the end of the billing period'
        : 'Subscription cancelled successfully'
    })

  } catch (error) {
    console.error('Subscription cancellation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/subscription?subscriptionId=xxx
 * Get subscription details
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const subscriptionId = searchParams.get('subscriptionId')

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId' },
        { status: 400 }
      )
    }

    // Get subscription details
    const result = await subscriptionService.getSubscriptionDetails(subscriptionId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to get subscription details' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: result.subscription
    })

  } catch (error) {
    console.error('Subscription details API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
