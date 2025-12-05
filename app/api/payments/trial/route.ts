/**
 * Free Trial API
 * Handles free trial operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import trialService from '@/lib/payments/trials'

/**
 * POST /api/payments/trial
 * Start a free trial
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
      trialDays,
      requiresCard,
      subscriptionPrice,
      subscriptionType,
      metadata
    } = body

    // Validate required fields
    if (!courseId || !trialDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate trial days
    if (trialDays < 1 || trialDays > 90) {
      return NextResponse.json(
        { error: 'Trial days must be between 1 and 90' },
        { status: 400 }
      )
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, free_trial_enabled')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (!course.free_trial_enabled) {
      return NextResponse.json(
        { error: 'Free trial not available for this course' },
        { status: 400 }
      )
    }

    // Start trial
    const result = await trialService.startTrial({
      courseId,
      studentId: user.id,
      trialDays: parseInt(trialDays),
      requiresCard: requiresCard === true,
      subscriptionPrice: subscriptionPrice ? parseFloat(subscriptionPrice) : undefined,
      subscriptionType,
      metadata
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to start trial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enrollmentId: result.enrollmentId,
      trialEndsAt: result.trialEndsAt
    })

  } catch (error) {
    console.error('Trial API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/trial
 * Get active trials for the current user
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

    // Get active trials
    const result = await trialService.getActiveTrials(user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch trials' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      trials: result.trials
    })

  } catch (error) {
    console.error('Get trials API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/payments/trial?enrollmentId=xxx
 * Cancel a trial
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
    const enrollmentId = searchParams.get('enrollmentId')
    const reason = searchParams.get('reason')

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Missing enrollmentId' },
        { status: 400 }
      )
    }

    // Verify enrollment belongs to user
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('student_id, is_trial')
      .eq('id', enrollmentId)
      .single()

    if (enrollmentError || !enrollment || enrollment.student_id !== user.id) {
      return NextResponse.json(
        { error: 'Enrollment not found or unauthorized' },
        { status: 404 }
      )
    }

    if (!enrollment.is_trial) {
      return NextResponse.json(
        { error: 'This is not a trial enrollment' },
        { status: 400 }
      )
    }

    // Cancel trial
    const result = await trialService.cancelTrial(enrollmentId, reason || undefined)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to cancel trial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Trial cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel trial API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/payments/trial?enrollmentId=xxx
 * Convert trial to paid subscription
 */
export async function PATCH(request: NextRequest) {
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
    const enrollmentId = searchParams.get('enrollmentId')

    // Parse request body
    const body = await request.json()
    const { subscriptionId } = body

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Missing enrollmentId' },
        { status: 400 }
      )
    }

    // Verify enrollment belongs to user
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('student_id, is_trial')
      .eq('id', enrollmentId)
      .single()

    if (enrollmentError || !enrollment || enrollment.student_id !== user.id) {
      return NextResponse.json(
        { error: 'Enrollment not found or unauthorized' },
        { status: 404 }
      )
    }

    if (!enrollment.is_trial) {
      return NextResponse.json(
        { error: 'This is not a trial enrollment' },
        { status: 400 }
      )
    }

    // Convert trial
    const result = await trialService.convertTrial(enrollmentId, subscriptionId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to convert trial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Trial converted successfully'
    })

  } catch (error) {
    console.error('Convert trial API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
