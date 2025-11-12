import { NextRequest, NextResponse } from 'next/server'
import { razorpayService } from '@/lib/payments/razorpay'

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
  // TODO: Update database
  // TODO: Grant course access
}

async function handlePaymentFailed(payment: any) {
  console.log('Razorpay payment failed:', payment.id)
  // TODO: Update database
}

async function handleRefundCreated(refund: any) {
  console.log('Razorpay refund created:', refund.id)
  // TODO: Update database
}

async function handleSubscriptionCharged(subscription: any) {
  console.log('Razorpay subscription charged:', subscription.id)
  // TODO: Update database
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log('Razorpay subscription cancelled:', subscription.id)
  // TODO: Update database
}
