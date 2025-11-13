import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/payments/stripe'

export const dynamic = 'force-dynamic'

// Force this route to use Node.js runtime
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    const result = await stripeService.confirmPayment(paymentIntentId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // TODO: Update database with payment status
    // TODO: Grant course access to user

    return NextResponse.json({
      success: true,
      order: {
        id: paymentIntentId,
        courseName: 'Course Name', // Fetch from database
        amount: (result.paymentIntent?.amount || 0) / 100,
        status: result.status,
      },
    })
  } catch (error) {
    console.error('Payment verification failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
