import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock coupons data
const mockCoupons = new Map([
  ['coupon_1', {
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
    status: 'active',
    createdAt: '2024-05-15T10:00:00Z'
  }]
])

// GET /api/admin/payments/coupons/[id] - Get coupon details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = mockCoupons.get(params.id)
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/payments/coupons/[id] - Update coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const coupon = mockCoupons.get(params.id)
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // Validate coupon code uniqueness if changed
    if (body.code && body.code !== coupon.code) {
      const codeExists = Array.from(mockCoupons.values()).some(
        c => c.code === body.code && c.id !== params.id
      )
      if (codeExists) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 400 }
        )
      }
    }

    // Update coupon
    const updatedCoupon = {
      ...coupon,
      ...body,
      updatedAt: new Date().toISOString()
    }

    mockCoupons.set(params.id, updatedCoupon)

    return NextResponse.json({
      message: 'Coupon updated successfully',
      coupon: updatedCoupon
    })
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/payments/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = mockCoupons.get(params.id)
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // Check if coupon has been used
    if (coupon.usedCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete coupon that has been used. Consider disabling it instead.' },
        { status: 400 }
      )
    }

    mockCoupons.delete(params.id)

    return NextResponse.json({
      message: 'Coupon deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
