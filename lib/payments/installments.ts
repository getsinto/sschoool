/**
 * Installment Payment Management
 * Handles payment plans and installment processing
 * Version: 1.0.0
 * Date: January 8, 2025
 */

import { createClient } from '@/lib/supabase/server'
import stripeService from './stripe'
import type { PaymentPlanFrequency } from '@/types/pricing'

// ============================================================================
// TYPES
// ============================================================================

export interface CreatePaymentPlanParams {
  courseId: string
  studentId: string
  totalAmount: number
  currency: string
  numInstallments: number
  frequency: PaymentPlanFrequency
  downPayment?: number
  metadata?: Record<string, string>
}

export interface PaymentPlanResult {
  success: boolean
  paymentPlanId?: string
  enrollmentId?: string
  firstPaymentClientSecret?: string
  nextPaymentDate?: string
  error?: string
}

export interface ProcessInstallmentParams {
  installmentId: string
  paymentMethodId?: string
}

export interface InstallmentResult {
  success: boolean
  installmentId?: string
  paymentIntentId?: string
  nextPaymentDate?: string
  error?: string
}

// ============================================================================
// INSTALLMENT SERVICE
// ============================================================================

class InstallmentService {
  /**
   * Create a payment plan with installments
   */
  async createPaymentPlan(params: CreatePaymentPlanParams): Promise<PaymentPlanResult> {
    try {
      const supabase = createClient()

      // 1. Validate parameters
      if (params.numInstallments < 2 || params.numInstallments > 12) {
        return {
          success: false,
          error: 'Number of installments must be between 2 and 12'
        }
      }

      const downPayment = params.downPayment || 0
      const remainingAmount = params.totalAmount - downPayment

      if (remainingAmount <= 0) {
        return {
          success: false,
          error: 'Remaining amount must be greater than 0'
        }
      }

      // 2. Get student details
      const { data: student, error: studentError } = await supabase
        .from('users')
        .select('id, email, full_name, stripe_customer_id')
        .eq('id', params.studentId)
        .single()

      if (studentError || !student) {
        return {
          success: false,
          error: 'Student not found'
        }
      }

      // 3. Get or create Stripe customer
      let stripeCustomerId = student.stripe_customer_id

      if (!stripeCustomerId) {
        const customerResult = await stripeService.createCustomer(
          student.email,
          student.full_name || 'Student',
          {
            userId: student.id,
            courseId: params.courseId
          }
        )

        if (!customerResult.success || !customerResult.customer) {
          return {
            success: false,
            error: 'Failed to create Stripe customer'
          }
        }

        stripeCustomerId = customerResult.customer.id

        // Save Stripe customer ID
        await supabase
          .from('users')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', student.id)
      }

      // 4. Create enrollment first
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: params.studentId,
          course_id: params.courseId,
          amount_paid: downPayment,
          original_price: params.totalAmount,
          payment_method: 'stripe',
          status: 'active',
          enrolled_at: new Date().toISOString()
        })
        .select()
        .single()

      if (enrollmentError || !enrollment) {
        return {
          success: false,
          error: 'Failed to create enrollment'
        }
      }

      // 5. Calculate installment amount
      const installmentAmount = remainingAmount / params.numInstallments

      // 6. Calculate next payment date
      const nextPaymentDate = this.calculateNextPaymentDate(new Date(), params.frequency)

      // 7. Create payment plan
      const { data: paymentPlan, error: planError } = await supabase
        .from('payment_plans')
        .insert({
          enrollment_id: enrollment.id,
          student_id: params.studentId,
          course_id: params.courseId,
          total_amount: params.totalAmount,
          down_payment: downPayment,
          remaining_amount: remainingAmount,
          installment_amount: installmentAmount,
          num_installments: params.numInstallments,
          installments_paid: 0,
          frequency: params.frequency,
          next_payment_date: nextPaymentDate.toISOString(),
          status: 'active'
        })
        .select()
        .single()

      if (planError || !paymentPlan) {
        // Rollback: Delete enrollment
        await supabase.from('enrollments').delete().eq('id', enrollment.id)
        
        return {
          success: false,
          error: 'Failed to create payment plan'
        }
      }

      // 8. Create installment records
      const installments = []
      let currentDueDate = new Date()

      for (let i = 1; i <= params.numInstallments; i++) {
        currentDueDate = this.calculateNextPaymentDate(currentDueDate, params.frequency)
        
        installments.push({
          payment_plan_id: paymentPlan.id,
          student_id: params.studentId,
          installment_number: i,
          amount: installmentAmount,
          due_date: currentDueDate.toISOString(),
          status: 'pending'
        })
      }

      const { error: installmentsError } = await supabase
        .from('installment_payments')
        .insert(installments)

      if (installmentsError) {
        // Rollback: Delete payment plan and enrollment
        await supabase.from('payment_plans').delete().eq('id', paymentPlan.id)
        await supabase.from('enrollments').delete().eq('id', enrollment.id)
        
        return {
          success: false,
          error: 'Failed to create installment records'
        }
      }

      // 9. Process down payment if required
      let firstPaymentClientSecret: string | undefined

      if (downPayment > 0) {
        const paymentResult = await stripeService.createPaymentIntent({
          amount: Math.round(downPayment * 100), // Convert to cents
          currency: params.currency,
          courseId: params.courseId,
          userId: params.studentId,
          metadata: {
            enrollmentId: enrollment.id,
            paymentPlanId: paymentPlan.id,
            paymentType: 'down_payment',
            ...params.metadata
          }
        })

        if (!paymentResult.success) {
          // Rollback everything
          await supabase.from('installment_payments').delete().eq('payment_plan_id', paymentPlan.id)
          await supabase.from('payment_plans').delete().eq('id', paymentPlan.id)
          await supabase.from('enrollments').delete().eq('id', enrollment.id)
          
          return {
            success: false,
            error: 'Failed to process down payment'
          }
        }

        firstPaymentClientSecret = paymentResult.clientSecret
      }

      // 10. Update enrollment with payment plan ID
      await supabase
        .from('enrollments')
        .update({ payment_plan_id: paymentPlan.id })
        .eq('id', enrollment.id)

      // 11. Log the payment plan creation
      await supabase
        .from('payment_logs')
        .insert({
          user_id: params.studentId,
          course_id: params.courseId,
          enrollment_id: enrollment.id,
          payment_method: 'stripe',
          amount: downPayment,
          currency: params.currency,
          status: 'succeeded',
          transaction_id: paymentPlan.id,
          metadata: {
            payment_type: 'payment_plan_created',
            total_amount: params.totalAmount,
            num_installments: params.numInstallments,
            frequency: params.frequency,
            ...params.metadata
          }
        })

      return {
        success: true,
        paymentPlanId: paymentPlan.id,
        enrollmentId: enrollment.id,
        firstPaymentClientSecret,
        nextPaymentDate: nextPaymentDate.toISOString()
      }

    } catch (error) {
      console.error('Payment plan creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Process a single installment payment
   */
  async processInstallment(params: ProcessInstallmentParams): Promise<InstallmentResult> {
    try {
      const supabase = createClient()

      // 1. Get installment details
      const { data: installment, error: installmentError } = await supabase
        .from('installment_payments')
        .select(`
          *,
          payment_plan:payment_plans(*)
        `)
        .eq('id', params.installmentId)
        .single()

      if (installmentError || !installment) {
        return {
          success: false,
          error: 'Installment not found'
        }
      }

      if (installment.status === 'paid') {
        return {
          success: false,
          error: 'Installment already paid'
        }
      }

      // 2. Get student details
      const { data: student, error: studentError } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', installment.student_id)
        .single()

      if (studentError || !student?.stripe_customer_id) {
        return {
          success: false,
          error: 'Student Stripe customer not found'
        }
      }

      // 3. Create payment intent
      const paymentResult = await stripeService.createPaymentIntent({
        amount: Math.round(installment.amount * 100), // Convert to cents
        currency: installment.payment_plan.currency || 'USD',
        courseId: installment.payment_plan.course_id,
        userId: installment.student_id,
        metadata: {
          installmentId: installment.id,
          paymentPlanId: installment.payment_plan_id,
          installmentNumber: installment.installment_number.toString(),
          paymentType: 'installment'
        }
      })

      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.error || 'Failed to create payment intent'
        }
      }

      // 4. Update installment with payment intent ID
      await supabase
        .from('installment_payments')
        .update({
          stripe_payment_intent_id: paymentResult.paymentIntentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', installment.id)

      return {
        success: true,
        installmentId: installment.id,
        paymentIntentId: paymentResult.paymentIntentId,
        nextPaymentDate: this.getNextInstallmentDate(installment.payment_plan_id)
      }

    } catch (error) {
      console.error('Installment processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Mark installment as paid (called by webhook)
   */
  async markInstallmentPaid(installmentId: string, transactionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      // 1. Update installment status
      const { data: installment, error: updateError } = await supabase
        .from('installment_payments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
          transaction_id: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', installmentId)
        .select()
        .single()

      if (updateError || !installment) {
        return {
          success: false,
          error: 'Failed to update installment'
        }
      }

      // 2. Update payment plan
      const { data: paymentPlan, error: planError } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('id', installment.payment_plan_id)
        .single()

      if (planError || !paymentPlan) {
        return {
          success: false,
          error: 'Payment plan not found'
        }
      }

      const installmentsPaid = paymentPlan.installments_paid + 1
      const isCompleted = installmentsPaid >= paymentPlan.num_installments

      // Calculate next payment date
      let nextPaymentDate: string | null = null
      if (!isCompleted) {
        const nextDate = this.calculateNextPaymentDate(new Date(), paymentPlan.frequency)
        nextPaymentDate = nextDate.toISOString()
      }

      await supabase
        .from('payment_plans')
        .update({
          installments_paid: installmentsPaid,
          next_payment_date: nextPaymentDate,
          status: isCompleted ? 'completed' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', installment.payment_plan_id)

      // 3. Update enrollment amount paid
      await supabase
        .from('enrollments')
        .update({
          amount_paid: supabase.raw(`amount_paid + ${installment.amount}`),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentPlan.enrollment_id)

      // 4. Log the payment
      await supabase
        .from('payment_logs')
        .insert({
          user_id: installment.student_id,
          course_id: paymentPlan.course_id,
          enrollment_id: paymentPlan.enrollment_id,
          payment_method: 'stripe',
          amount: installment.amount,
          currency: 'USD',
          status: 'succeeded',
          transaction_id: transactionId,
          metadata: {
            payment_type: 'installment',
            installment_number: installment.installment_number,
            payment_plan_id: installment.payment_plan_id,
            installments_paid: installmentsPaid,
            total_installments: paymentPlan.num_installments
          }
        })

      return { success: true }

    } catch (error) {
      console.error('Mark installment paid error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get upcoming installments for a student
   */
  async getUpcomingInstallments(studentId: string) {
    try {
      const supabase = createClient()

      const { data: installments, error } = await supabase
        .from('installment_payments')
        .select(`
          *,
          payment_plan:payment_plans(
            *,
            course:courses(title, thumbnail_url)
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(10)

      if (error) {
        return {
          success: false,
          error: 'Failed to fetch installments'
        }
      }

      return {
        success: true,
        installments
      }

    } catch (error) {
      console.error('Get upcoming installments error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get overdue installments
   */
  async getOverdueInstallments(studentId: string) {
    try {
      const supabase = createClient()

      const { data: installments, error } = await supabase
        .from('installment_payments')
        .select(`
          *,
          payment_plan:payment_plans(
            *,
            course:courses(title)
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })

      if (error) {
        return {
          success: false,
          error: 'Failed to fetch overdue installments'
        }
      }

      return {
        success: true,
        installments
      }

    } catch (error) {
      console.error('Get overdue installments error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Calculate next payment date based on frequency
   */
  private calculateNextPaymentDate(currentDate: Date, frequency: PaymentPlanFrequency): Date {
    const nextDate = new Date(currentDate)

    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14)
        break
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
    }

    return nextDate
  }

  /**
   * Get next installment due date
   */
  private async getNextInstallmentDate(paymentPlanId: string): Promise<string | undefined> {
    try {
      const supabase = createClient()

      const { data: nextInstallment } = await supabase
        .from('installment_payments')
        .select('due_date')
        .eq('payment_plan_id', paymentPlanId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(1)
        .single()

      return nextInstallment?.due_date

    } catch (error) {
      return undefined
    }
  }

  /**
   * Cancel payment plan
   */
  async cancelPaymentPlan(paymentPlanId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      // Update payment plan status
      const { error: planError } = await supabase
        .from('payment_plans')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentPlanId)

      if (planError) {
        return {
          success: false,
          error: 'Failed to cancel payment plan'
        }
      }

      // Cancel all pending installments
      await supabase
        .from('installment_payments')
        .update({
          status: 'cancelled',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('payment_plan_id', paymentPlanId)
        .eq('status', 'pending')

      return { success: true }

    } catch (error) {
      console.error('Cancel payment plan error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const installmentService = new InstallmentService()
export default installmentService
