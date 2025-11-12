import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/payments/stripe'
import { paypalService } from '@/lib/payments/paypal'
import { razorpayService } from '@/lib/payments/razorpay'

export async function POST(request: NextRequest) {
  try {
    const { courseId, paymentMethod, couponCode, amount, userId } = await request.json()

    // Validate input
    if (!courseId || !paymentMethod || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result

    switch (paymentMethod) {
      case 'stripe':
        result = await stripeService.createPaymentIntent({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          courseId,
          userId: userId || 'guest',
          couponCode,
        })
        break

      case 'paypal':
        result = await paypalService.createOrder({
          amount: amount.toString(),
          currency: 'USD',
          courseId,
          userId: userId || 'guest',
          couponCode,
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
        })
        break

      case 'razorpay':
        result = await razorpayService.createOrder({
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          courseId,
          userId: userId || 'guest',
          couponCode,
        })
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

    return NextResponse.json({
      success: true,
      orderId: result.orderId || result.paymentIntentId,
      ...result,
    })
  } catch (error) {
    console.error('Order creation failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
