import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/payments/stripe'

// Force this route to use Node.js runtime
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Retrieve payment intent from database or create new one
    // For now, returning mock client secret
    const result = await stripeService.getPaymentIntent(orderId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      clientSecret: result.paymentIntent?.client_secret,
    })
  } catch (error) {
    console.error('Payment intent retrieval failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
