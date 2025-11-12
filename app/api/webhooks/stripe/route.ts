import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/payments/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const result = stripeService.verifyWebhookSignature(body, signature, webhookSecret)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = result.event

    // Handle different event types
    switch (event?.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event?.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id)
  // TODO: Update database
  // TODO: Grant course access
  // TODO: Send confirmation email
}

async function handlePaymentFailure(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id)
  // TODO: Update database
  // TODO: Send failure notification
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id)
  // TODO: Update database
  // TODO: Grant subscription access
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id)
  // TODO: Update database
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log('Subscription cancelled:', subscription.id)
  // TODO: Update database
  // TODO: Revoke access
}

async function handleRefund(charge: any) {
  console.log('Refund processed:', charge.id)
  // TODO: Update database
  // TODO: Send refund confirmation
}
