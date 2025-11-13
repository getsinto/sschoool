import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchaseAmount: number
  usageLimit: number
  perUserLimit: number
  usedCount: number
  validFrom: string
  validUntil: string
  status: 'active' | 'expired' | 'disabled'
  applicableCourses: string[]
  applicableUserTypes: string[]
  description?: string
  createdAt: string
}

// Mock coupons data
const mockCoupons: Coupon[] = [
  {
    id: 'coupon_1',
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    minPurchaseAmount: 100,
    usageLimit: 100,
    perUserLimit: 1,
    usedCount: 45,
    validFrom: '2024-01-01',
    validUntil: '2024-03-31',
    status: 'active',
    applicableCourses: ['all'],
    applicableUserTypes: ['student'],
    description: '20% off for new students',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'coupon_2',
    code: 'NEWSTUDENT50',
    discountType: 'fixed',
    discountValue: 50,
    minPurchaseAmount: 200,
    usageLimit: 50,
    perUserLimit: 1,
    usedCount: 12,
    validFrom: '2024-01-15',
    validUntil: '2024-06-15',
    status: 'active',
    applicableCourses: ['course_1', 'course_2'],
    applicableUserTypes: ['student'],
    description: '$50 off for first-time students',
    createdAt: '2024-01-15T00:00:00Z'
  }
]

// GET /api/admin/payments/coupons - Get all coupons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filteredCoupons = [...mockCoupons]

    // Check for expired coupons and update status
    const now = new Date()
    filteredCoupons = filteredCoupons.map(coupon => {
      if (coupon.status === 'active' && new Date(coupon.validUntil) < now) {
        return { ...coupon, status: 'expired' as const }
      }
      return coupon
    })

    // Apply filters
    if (status && status !== 'all') {
      filteredCoupons = filteredCoupons.filter(coupon => coupon.status === status)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredCoupons = filteredCoupons.filter(coupon => 
        coupon.code.toLowerCase().includes(searchLower) ||
        (coupon.description && coupon.description.toLowerCase().includes(searchLower))
      )
    }

    // Sort by creation date (newest first)
    filteredCoupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCoupons = filteredCoupons.slice(startIndex, endIndex)

    return NextResponse.json({
      coupons: paginatedCoupons,
      pagination: {
        page,
        limit,
        total: filteredCoupons.length,
        totalPages: Math.ceil(filteredCoupons.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST /api/admin/payments/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      discountType,
      discountValue,
      minPurchaseAmount,
      usageLimit,
      perUserLimit,
      validFrom,
      validUntil,
      applicableCourses,
      applicableUserTypes,
      status,
      description
    } = body

    // Validate required fields
    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if coupon code already exists
    const existingCoupon = mockCoupons.find(c => c.code.toLowerCase() === code.toLowerCase())
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      )
    }

    // Validate discount value
    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 1 and 100' },
        { status: 400 }
      )
    }

    if (discountType === 'fixed' && discountValue <= 0) {
      return NextResponse.json(
        { error: 'Fixed discount must be greater than 0' },
        { status: 400 }
      )
    }

    // Validate dates
    if (new Date(validFrom) >= new Date(validUntil)) {
      return NextResponse.json(
        { error: 'Valid until date must be after valid from date' },
        { status: 400 }
      )
    }

    // Create new coupon
    const newCoupon: Coupon = {
      id: `coupon_${Date.now()}`,
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minPurchaseAmount: parseFloat(minPurchaseAmount) || 0,
      usageLimit: parseInt(usageLimit) || 100,
      perUserLimit: parseInt(perUserLimit) || 1,
      usedCount: 0,
      validFrom,
      validUntil,
      status: status || 'active',
      applicableCourses: applicableCourses || ['all'],
      applicableUserTypes: applicableUserTypes || ['student'],
      description: description || '',
      createdAt: new Date().toISOString()
    }

    // In real app, save to database
    mockCoupons.push(newCoupon)

    return NextResponse.json({
      message: 'Coupon created successfully',
      coupon: newCoupon
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}