import { NextRequest, NextResponse } from 'next/server'
import { paypalService } from '@/lib/payments/paypal'

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
  // TODO: Update database
  // TODO: Grant course access
}

async function handlePaymentDenied(resource: any) {
  console.log('PayPal payment denied:', resource.id)
  // TODO: Update database
}

async function handleRefund(resource: any) {
  console.log('PayPal refund processed:', resource.id)
  // TODO: Update database
}

async function handleSubscriptionCreated(resource: any) {
  console.log('PayPal subscription created:', resource.id)
  // TODO: Update database
}

async function handleSubscriptionCancelled(resource: any) {
  console.log('PayPal subscription cancelled:', resource.id)
  // TODO: Update database
}
