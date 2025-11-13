import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/payments/stripe'
import { razorpayService } from '@/lib/payments/razorpay'

export const dynamic = 'force-dynamic'

// Force this route to use Node.js runtime
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, paymentMethod, cancelAtPeriodEnd } = await request.json()

    if (!subscriptionId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result

    switch (paymentMethod) {
      case 'stripe':
        result = await stripeService.cancelSubscription(subscriptionId)
        break

      case 'razorpay':
        result = await razorpayService.cancelSubscription(
          subscriptionId,
          cancelAtPeriodEnd || false
        )
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid payment method' },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // TODO: Update database

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
    })
  } catch (error) {
    console.error('Subscription cancellation failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
