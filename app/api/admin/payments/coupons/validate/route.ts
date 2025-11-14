import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock coupons data
const mockCoupons = [
  {
    id: 'coupon_1',
    code: 'SUMMER2024',
    discountType: 'percentage',
    discountValue: 20,
    minPurchaseAmount: 50,
    usageLimitPerUser: 1,
    usageLimitTotal: 100,
    usedCount: 15,
    validFrom: '2024-06-01',
    validUntil: '2024-08-31',
    applicableCourses: 'all',
    applicableUserTypes: 'all',
    status: 'active'
  }
]

// POST /api/admin/payments/coupons/validate - Validate coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, userId, courseId, purchaseAmount } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    // Find coupon
    const coupon = mockCoupons.find(c => c.code.toUpperCase() === code.toUpperCase())

    if (!coupon) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Invalid coupon code'
        },
        { status: 200 }
      )
    }

    // Check if coupon is active
    if (coupon.status !== 'active') {
      return NextResponse.json(
        { 
          valid: false,
          error: 'This coupon is no longer active'
        },
        { status: 200 }
      )
    }

    // Check validity dates
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = new Date(coupon.validUntil)

    if (now < validFrom) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'This coupon is not yet valid'
        },
        { status: 200 }
      )
    }

    if (now > validUntil) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'This coupon has expired'
        },
        { status: 200 }
      )
    }

    // Check usage limit
    if (coupon.usageLimitTotal && coupon.usedCount >= coupon.usageLimitTotal) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'This coupon has reached its usage limit'
        },
        { status: 200 }
      )
    }

    // Check minimum purchase amount
    if (purchaseAmount && coupon.minPurchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
      return NextResponse.json(
        { 
          valid: false,
          error: `Minimum purchase amount of $${coupon.minPurchaseAmount} required`
        },
        { status: 200 }
      )
    }

    // Check user-specific usage limit
    if (userId && coupon.usageLimitPerUser) {
      // In real app, check database for user's usage count
      const userUsageCount = 0 // Mock
      if (userUsageCount >= coupon.usageLimitPerUser) {
        return NextResponse.json(
          { 
            valid: false,
            error: 'You have already used this coupon'
          },
          { status: 200 }
        )
      }
    }

    // Check applicable courses
    if (courseId && coupon.applicableCourses !== 'all') {
      // In real app, check if course is in applicable list
      const isApplicable = true // Mock
      if (!isApplicable) {
        return NextResponse.json(
          { 
            valid: false,
            error: 'This coupon is not applicable to this course'
          },
          { status: 200 }
        )
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (purchaseAmount) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (purchaseAmount * coupon.discountValue) / 100
      } else {
        discountAmount = coupon.discountValue
      }
      // Ensure discount doesn't exceed purchase amount
      discountAmount = Math.min(discountAmount, purchaseAmount)
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount
      },
      message: 'Coupon is valid'
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
