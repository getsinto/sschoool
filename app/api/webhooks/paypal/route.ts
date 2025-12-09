import { NextRequest, NextResponse } from 'next/server'
import { paypalService } from '@/lib/payments/paypal'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers: Record<string, string> = {}
    
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    const webhookId = process.env.PAYPAL_WEBHOOK_ID!
    const result = await paypalService.verifyWebhookSignature(headers, body, webhookId)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = result.event

    // Handle different event types
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(event.resource)
        break

      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(event.resource)
        break

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handleRefund(event.resource)
        break

      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(event.resource)
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event.resource)
        break

      default:
        console.log(`Unhandled PayPal event: ${event.event_type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCompleted(resource: any) {
  console.log('PayPal payment completed:', resource.id)
  
  try {
    const supabase = await createClient()
    
    // Extract payment details
    const paymentId = resource.id
    const amount = parseFloat(resource.amount?.value || '0')
    const currency = resource.amount?.currency_code || 'USD'
    const customId = resource.custom_id // Should contain user_id and course_id
    
    // Parse custom_id (format: "user_id:course_id")
    const [userId, courseId] = customId?.split(':') || []
    
    if (!userId || !courseId) {
      console.error('Invalid custom_id format:', customId)
      return
    }
    
    // Update payment record
    const { data: payment, error: paymentError } = await supabase
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
          payment_method: 'paypal',
          payment_intent_id: paymentId,
          transaction_id: paymentId,
          status: 'completed',
          payment_date: new Date().toISOString()
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
        payment_id: payment?.id,
        enrollment_date: new Date().toISOString()
      }, {
        onConflict: 'student_id,course_id'
      })
    
    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError)
      return
    }
    
    console.log('Successfully processed PayPal payment and granted course access')
  } catch (error) {
    console.error('Error in handlePaymentCompleted:', error)
  }
}

async function handlePaymentDenied(resource: any) {
  console.log('PayPal payment denied:', resource.id)
  
  try {
    const supabase = await createClient()
    const paymentId = resource.id
    
    // Update payment record to failed status
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('payment_intent_id', paymentId)
    
    if (error) {
      console.error('Error updating payment status:', error)
    }
  } catch (error) {
    console.error('Error in handlePaymentDenied:', error)
  }
}

async function handleRefund(resource: any) {
  console.log('PayPal refund processed:', resource.id)
  
  try {
    const supabase = await createClient()
    const refundId = resource.id
    const amount = parseFloat(resource.amount?.value || '0')
    const captureId = resource.links?.find((link: any) => link.rel === 'up')?.href?.split('/').pop()
    
    // Find the original payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, user_id, course_id')
      .eq('transaction_id', captureId)
      .single()
    
    if (paymentError || !payment) {
      console.error('Payment not found for refund:', captureId)
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
        reason: 'PayPal refund'
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
    
    // Optionally revoke course access
    // Uncomment if you want to automatically revoke access on refund
    /*
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', payment.user_id)
      .single()
    
    if (student) {
      await supabase
        .from('enrollments')
        .update({ status: 'cancelled' })
        .eq('student_id', student.id)
        .eq('course_id', payment.course_id)
    }
    */
    
    console.log('Successfully processed PayPal refund')
  } catch (error) {
    console.error('Error in handleRefund:', error)
  }
}

async function handleSubscriptionCreated(resource: any) {
  console.log('PayPal subscription created:', resource.id)
  
  try {
    const supabase = await createClient()
    const subscriptionId = resource.id
    const customId = resource.custom_id // Should contain user_id and course_id
    const startTime = resource.start_time
    const billingInfo = resource.billing_info
    
    // Parse custom_id (format: "user_id:course_id")
    const [userId, courseId] = customId?.split(':') || []
    
    if (!userId || !courseId) {
      console.error('Invalid custom_id format:', customId)
      return
    }
    
    // Create subscription record
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        course_id: courseId,
        subscription_id: subscriptionId,
        payment_method: 'paypal',
        status: 'active',
        current_period_start: startTime || new Date().toISOString(),
        current_period_end: billingInfo?.next_billing_time || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { resource }
      })
    
    if (error) {
      console.error('Error creating subscription:', error)
      return
    }
    
    console.log('Successfully created PayPal subscription')
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

async function handleSubscriptionCancelled(resource: any) {
  console.log('PayPal subscription cancelled:', resource.id)
  
  try {
    const supabase = await createClient()
    const subscriptionId = resource.id
    
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
    
    console.log('Successfully cancelled PayPal subscription')
  } catch (error) {
    console.error('Error in handleSubscriptionCancelled:', error)
  }
}
