/**
 * Free Trial Management
 * Handles free trial logic and conversions
 * Version: 1.0.0
 * Date: January 8, 2025
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// TYPES
// ============================================================================

export interface StartTrialParams {
  courseId: string
  studentId: string
  trialDays: number
  requiresCard: boolean
  subscriptionPrice?: number
  subscriptionType?: string
  metadata?: Record<string, string>
}

export interface TrialResult {
  success: boolean
  enrollmentId?: string
  trialEndsAt?: string
  error?: string
}

// ============================================================================
// TRIAL SERVICE
// ============================================================================

class TrialService {
  /**
   * Start a free trial
   */
  async startTrial(params: StartTrialParams): Promise<TrialResult> {
    try {
      const supabase = createClient()

      // 1. Check if course exists and has free trial enabled
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, title, free_trial_enabled, free_trial_days, trial_requires_card')
        .eq('id', params.courseId)
        .single()

      if (courseError || !course) {
        return {
          success: false,
          error: 'Course not found'
        }
      }

      if (!course.free_trial_enabled) {
        return {
          success: false,
          error: 'Free trial not available for this course'
        }
      }

      // 2. Check if student already had a trial for this course
      const { data: existingTrial } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', params.studentId)
        .eq('course_id', params.courseId)
        .eq('is_trial', true)
        .single()

      if (existingTrial) {
        return {
          success: false,
          error: 'You have already used your free trial for this course'
        }
      }

      // 3. Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', params.studentId)
        .eq('course_id', params.courseId)
        .eq('status', 'active')
        .single()

      if (existingEnrollment) {
        return {
          success: false,
          error: 'Already enrolled in this course'
        }
      }

      // 4. Calculate trial end date
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + params.trialDays)

      // 5. Create trial enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: params.studentId,
          course_id: params.courseId,
          is_trial: true,
          trial_ends_at: trialEndsAt.toISOString(),
          trial_converted: false,
          amount_paid: 0,
          original_price: params.subscriptionPrice || 0,
          payment_method: 'trial',
          status: 'active',
          enrolled_at: new Date().toISOString()
        })
        .select()
        .single()

      if (enrollmentError || !enrollment) {
        return {
          success: false,
          error: 'Failed to create trial enrollment'
        }
      }

      // 6. Log the trial start
      await supabase
        .from('payment_logs')
        .insert({
          user_id: params.studentId,
          course_id: params.courseId,
          enrollment_id: enrollment.id,
          payment_method: 'trial',
          amount: 0,
          currency: 'USD',
          status: 'succeeded',
          transaction_id: `trial_${enrollment.id}`,
          metadata: {
            trial_days: params.trialDays,
            requires_card: params.requiresCard,
            trial_ends_at: trialEndsAt.toISOString(),
            ...params.metadata
          }
        })

      // 7. Schedule trial end notification
      await this.scheduleTrialEndNotification(
        params.studentId,
        params.courseId,
        enrollment.id,
        trialEndsAt
      )

      return {
        success: true,
        enrollmentId: enrollment.id,
        trialEndsAt: trialEndsAt.toISOString()
      }

    } catch (error) {
      console.error('Start trial error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Convert trial to paid subscription
   */
  async convertTrial(enrollmentId: string, subscriptionId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const updateData: any = {
        is_trial: false,
        trial_converted: true,
        updated_at: new Date().toISOString()
      }

      if (subscriptionId) {
        updateData.subscription_id = subscriptionId
        updateData.subscription_status = 'active'
      }

      const { error } = await supabase
        .from('enrollments')
        .update(updateData)
        .eq('id', enrollmentId)

      if (error) {
        return {
          success: false,
          error: 'Failed to convert trial'
        }
      }

      // Log the conversion
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('student_id, course_id')
        .eq('id', enrollmentId)
        .single()

      if (enrollment) {
        await supabase
          .from('payment_logs')
          .insert({
            user_id: enrollment.student_id,
            course_id: enrollment.course_id,
            enrollment_id: enrollmentId,
            payment_method: 'stripe',
            amount: 0,
            currency: 'USD',
            status: 'succeeded',
            transaction_id: `trial_conversion_${enrollmentId}`,
            metadata: {
              event: 'trial_converted',
              subscription_id: subscriptionId
            }
          })
      }

      return { success: true }

    } catch (error) {
      console.error('Convert trial error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Cancel trial
   */
  async cancelTrial(enrollmentId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('enrollments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .eq('is_trial', true)

      if (error) {
        return {
          success: false,
          error: 'Failed to cancel trial'
        }
      }

      // Log the cancellation
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('student_id, course_id')
        .eq('id', enrollmentId)
        .single()

      if (enrollment) {
        await supabase
          .from('payment_logs')
          .insert({
            user_id: enrollment.student_id,
            course_id: enrollment.course_id,
            enrollment_id: enrollmentId,
            payment_method: 'trial',
            amount: 0,
            currency: 'USD',
            status: 'cancelled',
            transaction_id: `trial_cancel_${enrollmentId}`,
            metadata: {
              event: 'trial_cancelled',
              reason: reason
            }
          })
      }

      return { success: true }

    } catch (error) {
      console.error('Cancel trial error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check if trial has expired
   */
  async checkTrialExpiration(enrollmentId: string): Promise<{ expired: boolean; daysRemaining?: number }> {
    try {
      const supabase = createClient()

      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('trial_ends_at, is_trial')
        .eq('id', enrollmentId)
        .single()

      if (!enrollment || !enrollment.is_trial || !enrollment.trial_ends_at) {
        return { expired: false }
      }

      const trialEndDate = new Date(enrollment.trial_ends_at)
      const now = new Date()
      const expired = trialEndDate < now

      if (!expired) {
        const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return { expired: false, daysRemaining }
      }

      return { expired: true }

    } catch (error) {
      console.error('Check trial expiration error:', error)
      return { expired: false }
    }
  }

  /**
   * Get active trials for a student
   */
  async getActiveTrials(studentId: string) {
    try {
      const supabase = createClient()

      const { data: trials, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(
            id,
            title,
            thumbnail_url,
            subscription_price,
            subscription_type
          )
        `)
        .eq('student_id', studentId)
        .eq('is_trial', true)
        .eq('status', 'active')
        .order('trial_ends_at', { ascending: true })

      if (error) {
        return {
          success: false,
          error: 'Failed to fetch trials'
        }
      }

      return {
        success: true,
        trials
      }

    } catch (error) {
      console.error('Get active trials error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Schedule trial end notification
   */
  private async scheduleTrialEndNotification(
    studentId: string,
    courseId: string,
    enrollmentId: string,
    trialEndsAt: Date
  ) {
    try {
      const supabase = createClient()

      // Schedule notification 3 days before trial ends
      const notificationDate = new Date(trialEndsAt)
      notificationDate.setDate(notificationDate.getDate() - 3)

      if (notificationDate > new Date()) {
        await supabase
          .from('scheduled_notifications')
          .insert({
            user_id: studentId,
            type: 'trial_ending',
            title: 'Your free trial is ending soon',
            message: 'Your free trial will end in 3 days. Subscribe to continue access.',
            scheduled_for: notificationDate.toISOString(),
            related_type: 'enrollment',
            related_id: enrollmentId,
            metadata: {
              course_id: courseId,
              trial_ends_at: trialEndsAt.toISOString()
            }
          })
      }

      // Schedule notification on trial end day
      await supabase
        .from('scheduled_notifications')
        .insert({
          user_id: studentId,
          type: 'trial_ended',
          title: 'Your free trial has ended',
          message: 'Your free trial has ended. Subscribe now to continue learning.',
          scheduled_for: trialEndsAt.toISOString(),
          related_type: 'enrollment',
          related_id: enrollmentId,
          metadata: {
            course_id: courseId
          }
        })

    } catch (error) {
      console.error('Schedule trial end notification error:', error)
    }
  }

  /**
   * Process expired trials (run daily via cron)
   */
  async processExpiredTrials(): Promise<{ processed: number; errors: number }> {
    try {
      const supabase = createClient()

      // Get all expired trials that haven't been converted
      const { data: expiredTrials, error } = await supabase
        .from('enrollments')
        .select('id, student_id, course_id')
        .eq('is_trial', true)
        .eq('trial_converted', false)
        .eq('status', 'active')
        .lt('trial_ends_at', new Date().toISOString())

      if (error || !expiredTrials) {
        return { processed: 0, errors: 1 }
      }

      let processed = 0
      let errors = 0

      for (const trial of expiredTrials) {
        try {
          // Cancel the enrollment
          await supabase
            .from('enrollments')
            .update({
              status: 'expired',
              updated_at: new Date().toISOString()
            })
            .eq('id', trial.id)

          // Send notification
          await supabase
            .from('notifications')
            .insert({
              user_id: trial.student_id,
              type: 'trial_expired',
              title: 'Your free trial has expired',
              message: 'Your free trial has expired. Subscribe to regain access.',
              related_type: 'enrollment',
              related_id: trial.id,
              metadata: {
                course_id: trial.course_id
              }
            })

          processed++

        } catch (error) {
          console.error(`Failed to process expired trial ${trial.id}:`, error)
          errors++
        }
      }

      return { processed, errors }

    } catch (error) {
      console.error('Process expired trials error:', error)
      return { processed: 0, errors: 1 }
    }
  }
}

export const trialService = new TrialService()
export default trialService
