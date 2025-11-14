import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock transaction data
const mockTransactions = new Map([
  ['txn_1', {
    id: 'txn_1',
    transactionId: 'TXN001234567',
    studentId: 'student_1',
    studentName: 'John Doe',
    studentEmail: 'john.doe@example.com',
    courseId: 'course_1',
    courseName: 'Mathematics Grade 10',
    coursePrice: 99.99,
    discount: 10.00,
    couponCode: 'SUMMER10',
    subtotal: 89.99,
    tax: 0,
    total: 89.99,
    amount: 89.99,
    currency: 'USD',
    gateway: 'stripe',
    gatewayTransactionId: 'pi_1234567890',
    status: 'completed',
    date: '2024-01-15T10:30:00Z',
    gatewayResponse: {
      id: 'pi_1234567890',
      status: 'succeeded',
      payment_method: 'card',
      last4: '4242'
    }
  }]
])

// GET /api/admin/payments/[id] - Get transaction details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = mockTransactions.get(params.id)
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/payments/[id] - Update transaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const transaction = mockTransactions.get(params.id)
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update transaction
    const updatedTransaction = {
      ...transaction,
      ...body,
      updatedAt: new Date().toISOString()
    }

    mockTransactions.set(params.id, updatedTransaction)

    return NextResponse.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}
