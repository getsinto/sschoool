import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - Test payment gateway connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gateway, credentials } = body

    if (!gateway || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: gateway, credentials' },
        { status: 400 }
      )
    }

    // Mock payment gateway test
    // In production, actually test the connection with the gateway
    const testResults: Record<string, any> = {
      stripe: {
        success: true,
        message: 'Stripe connection successful',
        details: {
          accountId: 'acct_test123',
          currency: 'USD',
          country: 'US'
        }
      },
      paypal: {
        success: true,
        message: 'PayPal connection successful',
        details: {
          merchantId: 'merchant_test456',
          email: credentials.email || 'test@paypal.com'
        }
      },
      razorpay: {
        success: true,
        message: 'Razorpay connection successful',
        details: {
          accountId: 'acc_test789',
          currency: 'INR'
        }
      }
    }

    const result = testResults[gateway.toLowerCase()] || {
      success: false,
      message: 'Unknown payment gateway'
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        details: result.details
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment gateway test error:', error)
    return NextResponse.json(
      { error: 'Failed to test payment gateway' },
      { status: 500 }
    )
  }
}
