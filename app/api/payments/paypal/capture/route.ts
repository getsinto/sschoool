import { NextRequest, NextResponse } from 'next/server'
import { paypalService } from '@/lib/payments/paypal'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const result = await paypalService.captureOrder({ orderId })

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
      captureId: result.captureId,
      status: result.status,
    })
  } catch (error) {
    console.error('PayPal capture failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
