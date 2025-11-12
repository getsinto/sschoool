import { NextRequest, NextResponse } from 'next/server'
import { razorpayService } from '@/lib/payments/razorpay'

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature } = await request.json()

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const isValid = razorpayService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    })

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // TODO: Update database with payment status
    // TODO: Grant course access to user

    return NextResponse.json({
      success: true,
      paymentId,
    })
  } catch (error) {
    console.error('Razorpay verification failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
