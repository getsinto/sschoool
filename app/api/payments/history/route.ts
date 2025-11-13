import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch from database
    // const { data, error } = await supabase
    //   .from('payments')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false })
    //   .range((page - 1) * pageSize, page * pageSize - 1)

    // Mock data for now
    const mockPayments = [
      {
        id: '1',
        userId,
        courseId: 'course-1',
        courseName: 'Advanced React Development',
        amount: 199.00,
        currency: 'USD',
        paymentMethod: 'stripe',
        status: 'succeeded',
        createdAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      payments: mockPayments,
      total: mockPayments.length,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Payment history retrieval failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
