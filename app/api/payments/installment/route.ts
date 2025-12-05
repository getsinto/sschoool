/**
 * Installment Payment API
 * Handles payment plan creation and installment processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import installmentService from '@/lib/payments/installments'

/**
 * POST /api/payments/installment
 * Create a payment plan or process an installment
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
    const { action } = body

    // Handle different actions
    if (action === 'create_plan') {
      return await handleCreatePlan(user.id, body, supabase)
    } else if (action === 'process_installment') {
      return await handleProcessInstallment(user.id, body, supabase)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "create_plan" or "process_installment"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Installment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle payment plan creation
 */
async function handleCreatePlan(userId: string, body: any, supabase: any) {
  const {
    courseId,
    totalAmount,
    currency,
    numInstallments,
    frequency,
    downPayment,
    metadata
  } = body

  // Validate required fields
  if (!courseId || !totalAmount || !currency || !numInstallments || !frequency) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Validate frequency
  if (!['weekly', 'biweekly', 'monthly'].includes(frequency)) {
    return NextResponse.json(
      { error: 'Invalid frequency. Use "weekly", "biweekly", or "monthly"' },
      { status: 400 }
    )
  }

  // Check if course exists
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, price')
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
    .eq('student_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single()

  if (existingEnrollment) {
    return NextResponse.json(
      { error: 'Already enrolled in this course' },
      { status: 400 }
    )
  }

  // Create payment plan
  const result = await installmentService.createPaymentPlan({
    courseId,
    studentId: userId,
    totalAmount: parseFloat(totalAmount),
    currency,
    numInstallments: parseInt(numInstallments),
    frequency,
    downPayment: downPayment ? parseFloat(downPayment) : undefined,
    metadata
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Failed to create payment plan' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    paymentPlanId: result.paymentPlanId,
    enrollmentId: result.enrollmentId,
    firstPaymentClientSecret: result.firstPaymentClientSecret,
    nextPaymentDate: result.nextPaymentDate
  })
}

/**
 * Handle installment processing
 */
async function handleProcessInstallment(userId: string, body: any, supabase: any) {
  const { installmentId, paymentMethodId } = body

  if (!installmentId) {
    return NextResponse.json(
      { error: 'Missing installmentId' },
      { status: 400 }
    )
  }

  // Verify installment belongs to user
  const { data: installment, error: installmentError } = await supabase
    .from('installment_payments')
    .select('student_id')
    .eq('id', installmentId)
    .single()

  if (installmentError || !installment || installment.student_id !== userId) {
    return NextResponse.json(
      { error: 'Installment not found or unauthorized' },
      { status: 404 }
    )
  }

  // Process installment
  const result = await installmentService.processInstallment({
    installmentId,
    paymentMethodId
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Failed to process installment' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    installmentId: result.installmentId,
    paymentIntentId: result.paymentIntentId,
    nextPaymentDate: result.nextPaymentDate
  })
}

/**
 * GET /api/payments/installment?type=upcoming|overdue
 * Get installments for the current user
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
    const type = searchParams.get('type') || 'upcoming'

    let result

    if (type === 'overdue') {
      result = await installmentService.getOverdueInstallments(user.id)
    } else {
      result = await installmentService.getUpcomingInstallments(user.id)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch installments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      installments: result.installments
    })

  } catch (error) {
    console.error('Get installments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/payments/installment?paymentPlanId=xxx
 * Cancel a payment plan
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
    const paymentPlanId = searchParams.get('paymentPlanId')
    const reason = searchParams.get('reason')

    if (!paymentPlanId) {
      return NextResponse.json(
        { error: 'Missing paymentPlanId' },
        { status: 400 }
      )
    }

    // Verify payment plan belongs to user
    const { data: paymentPlan, error: planError } = await supabase
      .from('payment_plans')
      .select('student_id')
      .eq('id', paymentPlanId)
      .single()

    if (planError || !paymentPlan || paymentPlan.student_id !== user.id) {
      return NextResponse.json(
        { error: 'Payment plan not found or unauthorized' },
        { status: 404 }
      )
    }

    // Cancel payment plan
    const result = await installmentService.cancelPaymentPlan(
      paymentPlanId,
      reason || undefined
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to cancel payment plan' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment plan cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel payment plan API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
