import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/admin/payments/[id]/refund - Process refund
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { reason, amount, type } = body

    if (!reason || !amount) {
      return NextResponse.json(
        { error: 'Reason and amount are required' },
        { status: 400 }
      )
    }

    // In real app, process refund through payment gateway
    // Stripe example:
    // const refund = await stripe.refunds.create({
    //   payment_intent: transaction.gatewayTransactionId,
    //   amount: Math.round(amount * 100), // Convert to cents
    //   reason: 'requested_by_customer'
    // })

    // PayPal example:
    // const refund = await paypal.refund({
    //   transaction_id: transaction.gatewayTransactionId,
    //   amount: { value: amount, currency: 'USD' }
    // })

    // Razorpay example:
    // const refund = await razorpay.payments.refund(
    //   transaction.gatewayTransactionId,
    //   { amount: amount * 100 }
    // )

    const refundData = {
      id: `refund_${Date.now()}`,
      transactionId: params.id,
      amount,
      type,
      reason,
      status: 'processing',
      processedAt: new Date().toISOString(),
      processedBy: 'admin', // In real app, get from session
      gatewayRefundId: `rf_${Math.random().toString(36).substring(7)}`
    }

    // In real app, save to database
    console.log('Refund processed:', refundData)

    return NextResponse.json({
      message: 'Refund processed successfully',
      refund: refundData
    }, { status: 200 })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}

// GET /api/admin/payments/[id]/refund - Get refund status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In real app, fetch refund details from database
    const refundStatus = {
      transactionId: params.id,
      refunds: [
        {
          id: 'refund_1',
          amount: 89.99,
          status: 'completed',
          processedAt: '2024-01-16T10:00:00Z'
        }
      ]
    }

    return NextResponse.json(refundStatus)
  } catch (error) {
    console.error('Error fetching refund status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch refund status' },
      { status: 500 }
    )
  }
}
