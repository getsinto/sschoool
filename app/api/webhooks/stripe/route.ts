/**
 * Stripe Webhook Handler
 * Processes Stripe events for subscriptions and payments
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import stripeService from '@/lib/payments/stripe'
import installmentService from '@/lib/payments/installments'
import subscriptionService from '@/lib/payments/subscriptions'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const verificationResult = stripeService.verifyWebhookSignature(
      body,
      signature,
      webhookSecret
    )

    if (!verificationResult.success || !verificationResult.event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = verificationResult.event

    // Handle different event types
    switch (event.type) {
      // Payment Intent Events
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      // Subscription Events
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      // Invoice Events
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const supabase = createClient()
    const metadata = paymentIntent.metadata

    // Check if this is an installment payment
    if (metadata.installmentId) {
      await installmentService.markInstallmentPaid(
        metadata.installmentId,
        paymentIntent.id
      )
    }

    // Check if this is a down payment
    if (metadata.paymentType === 'down_payment' && metadata.enrollmentId) {
      await supabase
        .from('enrollments')
        .update({
          payment_status: 'partial',
          updated_at: new Date().toISOString()
        })
        .eq('id', metadata.enrollmentId)
    }

    // Check if this is a one-time payment
    if (metadata.paymentType === 'one_time' && metadata.enrollmentId) {
      await supabase
        .from('enrollments')
        .update({
          payment_status: 'paid',
          amount_paid: paymentIntent.amount / 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', metadata.enrollmentId)
    }

    // Log the payment
    await supabase
      .from('payment_logs')
      .insert({
        user_id: metadata.userId,
        course_id: metadata.courseId,
        enrollment_id: metadata.enrollmentId,
        payment_method: 'stripe',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'succeeded',
        transaction_id: paymentIntent.id,
        metadata: metadata
      })

    console.log(`Payment succeeded: ${paymentIntent.id}`)

  } catch (error) {
    console.error('Handle payment intent succeeded error:', error)
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const supabase = createClient()
    const metadata = paymentIntent.metadata

    // Check if this is an installment payment
    if (metadata.installmentId) {
      await supabase
        .from('installment_payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', metadata.installmentId)
    }

    // Log the failed payment
    await supabase
      .from('payment_logs')
      .insert({
        user_id: metadata.userId,
        course_id: metadata.courseId,
        enrollment_id: metadata.enrollmentId,
        payment_method: 'stripe',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'failed',
        transaction_id: paymentIntent.id,
        metadata: {
          ...metadata,
          failure_message: paymentIntent.last_payment_error?.message
        }
      })

    console.log(`Payment failed: ${paymentIntent.id}`)

  } catch (error) {
    console.error('Handle payment intent failed error:', error)
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const supabase = createClient()
    const metadata = subscription.metadata

    // Update enrollment with subscription info
    if (metadata.enrollmentId) {
      await supabase
        .from('enrollments')
        .update({
          subscription_id: subscription.id,
          subscription_status: subscription.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', metadata.enrollmentId)
    }

    console.log(`Subscription created: ${subscription.id}`)

  } catch (error) {
    console.error('Handle subscription created error:', error)
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const supabase = createClient()

    // Find enrollment by subscription ID
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, student_id, course_id')
      .eq('subscription_id', subscription.id)
      .single()

    if (!enrollment) {
      console.log(`No enrollment found for subscription: ${subscription.id}`)
      return
    }

    // Update subscription status
    await supabase
      .from('enrollments')
      .update({
        subscription_status: subscription.status,
        status: subscription.status === 'active' ? 'active' : 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollment.id)

    // If trial ended, convert trial
    if (subscription.status === 'active' && subscription.trial_end) {
      const trialEndDate = new Date(subscription.trial_end * 1000)
      if (trialEndDate < new Date()) {
        await subscriptionService.convertTrial(enrollment.id)
      }
    }

    console.log(`Subscription updated: ${subscription.id}`)

  } catch (error) {
    console.error('Handle subscription updated error:', error)
  }
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const supabase = createClient()

    // Find enrollment by subscription ID
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('subscription_id', subscription.id)
      .single()

    if (!enrollment) {
      console.log(`No enrollment found for subscription: ${subscription.id}`)
      return
    }

    // Update enrollment status
    await supabase
      .from('enrollments')
      .update({
        subscription_status: 'cancelled',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollment.id)

    console.log(`Subscription deleted: ${subscription.id}`)

  } catch (error) {
    console.error('Handle subscription deleted error:', error)
  }
}

/**
 * Handle trial will end (3 days before)
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const supabase = createClient()

    // Find enrollment by subscription ID
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, student_id, course_id')
      .eq('subscription_id', subscription.id)
      .single()

    if (!enrollment) {
      console.log(`No enrollment found for subscription: ${subscription.id}`)
      return
    }

    // Send notification to student
    await supabase
      .from('notifications')
      .insert({
        user_id: enrollment.student_id,
        type: 'trial_ending',
        title: 'Your free trial is ending soon',
        message: 'Your free trial will end in 3 days. Your subscription will automatically start.',
        related_type: 'enrollment',
        related_id: enrollment.id,
        metadata: {
          subscription_id: subscription.id,
          course_id: enrollment.course_id
        }
      })

    console.log(`Trial will end notification sent for subscription: ${subscription.id}`)

  } catch (error) {
    console.error('Handle trial will end error:', error)
  }
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    const supabase = createClient()

    // Get subscription from invoice
    if (invoice.subscription) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, student_id, course_id')
        .eq('subscription_id', invoice.subscription)
        .single()

      if (enrollment) {
        // Log the payment
        await supabase
          .from('payment_logs')
          .insert({
            user_id: enrollment.student_id,
            course_id: enrollment.course_id,
            enrollment_id: enrollment.id,
            payment_method: 'stripe',
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'succeeded',
            transaction_id: invoice.id,
            metadata: {
              subscription_id: invoice.subscription,
              invoice_id: invoice.id
            }
          })
      }
    }

    console.log(`Invoice paid: ${invoice.id}`)

  } catch (error) {
    console.error('Handle invoice paid error:', error)
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const supabase = createClient()

    // Get subscription from invoice
    if (invoice.subscription) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, student_id, course_id')
        .eq('subscription_id', invoice.subscription)
        .single()

      if (enrollment) {
        // Update subscription status
        await supabase
          .from('enrollments')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('id', enrollment.id)

        // Send notification to student
        await supabase
          .from('notifications')
          .insert({
            user_id: enrollment.student_id,
            type: 'payment_failed',
            title: 'Payment failed',
            message: 'Your subscription payment failed. Please update your payment method.',
            related_type: 'enrollment',
            related_id: enrollment.id,
            metadata: {
              subscription_id: invoice.subscription,
              invoice_id: invoice.id
            }
          })

        // Log the failed payment
        await supabase
          .from('payment_logs')
          .insert({
            user_id: enrollment.student_id,
            course_id: enrollment.course_id,
            enrollment_id: enrollment.id,
            payment_method: 'stripe',
            amount: invoice.amount_due / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'failed',
            transaction_id: invoice.id,
            metadata: {
              subscription_id: invoice.subscription,
              invoice_id: invoice.id,
              failure_message: 'Payment failed'
            }
          })
      }
    }

    console.log(`Invoice payment failed: ${invoice.id}`)

  } catch (error) {
    console.error('Handle invoice payment failed error:', error)
  }
}
