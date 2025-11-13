import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/payments/stripe'
import { razorpayService } from '@/lib/payments/razorpay'

export const dynamic = 'force-dynamic'

// Force this route to use Node.js runtime
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { paymentMethod, priceId, planId, userId, courseId, couponCode } = await request.json()

    if (!paymentMethod || !userId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result

    switch (paymentMethod) {
      case 'stripe':
        if (!priceId) {
          return NextResponse.json(
            { success: false, error: 'Price ID is required for Stripe' },
            { status: 400 }
          )
        }

        // Create or get customer
        const customerResult = await stripeService.createCustomer(
          'user@example.com', // TODO: Get from user data
          'User Name', // TODO: Get from user data
          { userId, courseId }
        )

        if (!customerResult.success) {
          return NextResponse.json(
            { success: false, error: customerResult.error },
            { status: 500 }
          )
        }

        result = await stripeService.createSubscription({
          customerId: customerResult.customer!.id,
          priceId,
          courseId,
          userId,
          couponCode,
        })
        break

      case 'razorpay':
        if (!planId) {
          return NextResponse.json(
            { success: false, error: 'Plan ID is required for Razorpay' },
            { status: 400 }
          )
        }

        result = await razorpayService.createSubscription(
          planId,
          userId, // TODO: Use Razorpay customer ID
          12 // Default to 12 months
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

    // TODO: Save subscription to database

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
      clientSecret: result.clientSecret,
    })
  } catch (error) {
    console.error('Subscription creation failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
