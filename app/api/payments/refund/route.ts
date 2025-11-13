import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/payments/stripe'
import { paypalService } from '@/lib/payments/paypal'
import { razorpayService } from '@/lib/payments/razorpay'

export const dynamic = 'force-dynamic'

// Force this route to use Node.js runtime
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { paymentId, paymentMethod, amount, reason } = await request.json()

    if (!paymentId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result

    switch (paymentMethod) {
      case 'stripe':
        result = await stripeService.processRefund({
          paymentIntentId: paymentId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason,
        })
        break

      case 'paypal':
        result = await paypalService.processRefund({
          captureId: paymentId,
          amount: amount?.toString(),
          currency: 'USD',
          reason,
        })
        break

      case 'razorpay':
        result = await razorpayService.processRefund({
          paymentId,
          amount: amount ? Math.round(amount * 100) : undefined,
          notes: { reason },
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

    // TODO: Update database with refund status

    return NextResponse.json({
      success: true,
      refund: result.refund,
    })
  } catch (error) {
    console.error('Refund processing failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
