import { NextRequest, NextResponse } from 'next/server'

interface Transaction {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  amount: number
  currency: string
  gateway: 'stripe' | 'paypal' | 'razorpay'
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  date: string
  couponCode?: string
  discountAmount?: number
}

// Mock transactions data
const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    studentId: 'student_1',
    studentName: 'John Smith',
    courseId: 'course_1',
    courseName: 'Mathematics Grade 10',
    amount: 299.99,
    currency: 'USD',
    gateway: 'stripe',
    status: 'completed',
    date: '2024-01-18T14:30:00Z',
    couponCode: 'SAVE20',
    discountAmount: 60.00
  },
  {
    id: 'txn_002',
    studentId: 'student_2',
    studentName: 'Sarah Johnson',
    courseId: 'course_2',
    courseName: 'Physics Grade 11',
    amount: 399.99,
    currency: 'USD',
    gateway: 'paypal',
    status: 'completed',
    date: '2024-01-17T10:15:00Z'
  },
  {
    id: 'txn_003',
    studentId: 'student_3',
    studentName: 'Mike Chen',
    courseId: 'course_3',
    courseName: 'Chemistry Grade 9',
    amount: 249.99,
    currency: 'USD',
    gateway: 'razorpay',
    status: 'pending',
    date: '2024-01-16T16:45:00Z'
  },
  {
    id: 'txn_004',
    studentId: 'student_4',
    studentName: 'Emily Davis',
    courseId: 'course_1',
    courseName: 'Mathematics Grade 10',
    amount: 299.99,
    currency: 'USD',
    gateway: 'stripe',
    status: 'refunded',
    date: '2024-01-15T09:20:00Z'
  }
]

// GET /api/admin/payments - Get all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const gateway = searchParams.get('gateway')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filteredTransactions = [...mockTransactions]

    // Apply filters
    if (status && status !== 'all') {
      filteredTransactions = filteredTransactions.filter(txn => txn.status === status)
    }

    if (gateway && gateway !== 'all') {
      filteredTransactions = filteredTransactions.filter(txn => txn.gateway === gateway)
    }

    if (dateFrom) {
      filteredTransactions = filteredTransactions.filter(txn => txn.date >= dateFrom)
    }

    if (dateTo) {
      filteredTransactions = filteredTransactions.filter(txn => txn.date <= dateTo)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredTransactions = filteredTransactions.filter(txn => 
        txn.id.toLowerCase().includes(searchLower) ||
        txn.studentName.toLowerCase().includes(searchLower) ||
        txn.courseName.toLowerCase().includes(searchLower)
      )
    }

    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

    // Calculate statistics
    const stats = {
      totalRevenue: mockTransactions
        .filter(txn => txn.status === 'completed')
        .reduce((sum, txn) => sum + txn.amount, 0),
      monthlyRevenue: mockTransactions
        .filter(txn => {
          const txnDate = new Date(txn.date)
          const now = new Date()
          return txn.status === 'completed' && 
                 txnDate.getMonth() === now.getMonth() && 
                 txnDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, txn) => sum + txn.amount, 0),
      weeklyRevenue: mockTransactions
        .filter(txn => {
          const txnDate = new Date(txn.date)
          const now = new Date()
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return txn.status === 'completed' && txnDate >= weekAgo
        })
        .reduce((sum, txn) => sum + txn.amount, 0),
      pendingPayments: mockTransactions.filter(txn => txn.status === 'pending').length,
      refundedAmount: mockTransactions
        .filter(txn => txn.status === 'refunded')
        .reduce((sum, txn) => sum + txn.amount, 0),
      totalTransactions: mockTransactions.length
    }

    return NextResponse.json({
      transactions: paginatedTransactions,
      stats,
      pagination: {
        page,
        limit,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}