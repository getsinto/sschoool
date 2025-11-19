import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const mockPayments = {
      payments: [
        {
          id: 'pay_1',
          date: '2024-01-15',
          childName: 'Alice Johnson',
          courseName: 'Advanced Mathematics',
          amount: 299,
          method: 'Credit Card',
          status: 'paid'
        }
      ],
      summary: {
        totalSpent: 5000,
        thisMonth: 500,
        pending: 200
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 1
      }
    }

    return NextResponse.json({ success: true, data: mockPayments })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
