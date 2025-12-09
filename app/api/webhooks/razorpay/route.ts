import { NextRequest, NextResponse } from 'next/server'
import { razorpayService } from '@/lib/payments/razorpay'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
    const isValid = razorpayService.verifyWebhookSignature(body, signature, webhookSecret)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break

      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity)
        break

      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity)
        break

      default:
        console.log(`Unhandled Razorpay event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCaptured(payment: any) {
  console.log('Razorpay payment captured:', payment.id)
  
  try {
    const supabase = await createClient()
    
    // Extract payment details
    const paymentId = payment.id
    const amount = payment.amount / 100 // Razorpay amounts are in paise
    const currency = payment.currency || 'INR'
    const notes = payment.notes || {}
    const userId = notes.user_id
    const courseId = notes.course_id
    
    if (!userId || !courseId) {
      console.error('Missing user_id or course_id in payment notes')
      return
    }
    
    // Update payment record
    const { data: existingPayment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        transaction_id: paymentId,
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('payment_intent_id', paymentId)
      .select()
      .single()
    
    if (paymentError) {
      console.error('Error updating payment:', paymentError)
      // If payment doesn't exist, create it
      const { data: newPayment, error: createError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          course_id: courseId,
          amount,
          currency,
          payment_method: 'razorpay',
          payment_intent_id: paymentId,
          transaction_id: paymentId,
          status: 'completed',
          payment_date: new Date().toISOString(),
          metadata: { notes }
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating payment:', createError)
        return
      }
    }
    
    // Get student_id from user_id
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    if (studentError || !student) {
      console.error('Student not found for user:', userId)
      return
    }
    
    // Grant course access by creating enrollment
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .upsert({
        student_id: student.id,
        course_id: courseId,
        status: 'active',
        payment_id: existingPayment?.id,
        enrollment_date: new Date().toISOString()
      }, {
        onConflict: 'student_id,course_id'
      })
    
    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError)
      return
    }
    
    console.log('Successfully processed Razorpay payment and granted course access')
  } catch (error) {
    console.error('Error in handlePaymentCaptured:', error)
  }
}

async function handlePaymentFailed(payment: any) {
  console.log('Razorpay payment failed:', payment.id)
  
  try {
    const supabase = await createClient()
    const paymentId = payment.id
    
    // Update payment record to failed status
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        metadata: { error_description: payment.error_description },
        updated_at: new Date().toISOString()
      })
      .eq('payment_intent_id', paymentId)
    
    if (error) {
      console.error('Error updating payment status:', error)
    }
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error)
  }
}

async function handleRefundCreated(refund: any) {
  console.log('Razorpay refund created:', refund.id)
  
  try {
    const supabase = await createClient()
    const refundId = refund.id
    const amount = refund.amount / 100 // Razorpay amounts are in paise
    const paymentId = refund.payment_id
    
    // Find the original payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, user_id, course_id')
      .eq('transaction_id', paymentId)
      .single()
    
    if (paymentError || !payment) {
      console.error('Payment not found for refund:', paymentId)
      return
    }
    
    // Create refund record
    const { error: refundError } = await supabase
      .from('refunds')
      .insert({
        payment_id: payment.id,
        amount,
        refund_id: refundId,
        status: 'succeeded',
        reason: 'Razorpay refund'
      })
    
    if (refundError) {
      console.error('Error creating refund record:', refundError)
      return
    }
    
    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)
    
    if (updateError) {
      console.error('Error updating payment status:', updateError)
    }
    
    console.log('Successfully processed Razorpay refund')
  } catch (error) {
    console.error('Error in handleRefundCreated:', error)
  }
}

async function handleSubscriptionCharged(subscription: any) {
  console.log('Razorpay subscription charged:', subscription.id)
  
  try {
    const supabase = await createClient()
    const subscriptionId = subscription.id
    const notes = subscription.notes || {}
    const userId = notes.user_id
    const courseId = notes.course_id
    
    if (!userId || !courseId) {
      console.error('Missing user_id or course_id in subscription notes')
      return
    }
    
    // Update or create subscription record
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        course_id: courseId,
        subscription_id: subscriptionId,
        payment_method: 'razorpay',
        status: 'active',
        current_period_start: new Date(subscription.current_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_end * 1000).toISOString(),
        metadata: { subscription }
      }, {
        onConflict: 'subscription_id'
      })
    
    if (error) {
      console.error('Error updating subscription:', error)
      return
    }
    
    console.log('Successfully processed Razorpay subscription charge')
  } catch (error) {
    console.error('Error in handleSubscriptionCharged:', error)
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log('Razorpay subscription cancelled:', subscription.id)
  
  try {
    const supabase = await createClient()
    const subscriptionId = subscription.id
    
    // Update subscription status
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscriptionId)
    
    if (error) {
      console.error('Error updating subscription:', error)
      return
    }
    
    console.log('Successfully cancelled Razorpay subscription')
  } catch (error) {
    console.error('Error in handleSubscriptionCancelled:', error)
  }
}
