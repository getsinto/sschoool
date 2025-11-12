import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, courseId } = await request.json()

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    // TODO: Validate coupon from database
    // Mock validation for now
    const mockCoupons: Record<string, any> = {
      'SAVE10': { code: 'SAVE10', discount: 10, valid: true },
      'SAVE20': { code: 'SAVE20', discount: 20, valid: true },
      'SAVE50': { code: 'SAVE50', discount: 50, valid: true },
    }

    const coupon = mockCoupons[code.toUpperCase()]

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid coupon code',
      })
    }

    return NextResponse.json({
      valid: true,
      coupon,
    })
  } catch (error) {
    console.error('Coupon validation failed:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
