'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TransactionTable from '@/components/admin/payments/TransactionTable'
import RefundModal from '@/components/admin/payments/RefundModal'
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  RefreshCw,
  Download,
  Calendar,
  AlertCircle,
  Tag
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Transaction {
  id: string
  transactionId: string
  studentName: string
  studentEmail: string
  courseName: string
  amount: number
  currency: string
  gateway: 'stripe' | 'paypal' | 'razorpay'
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  date: string
  couponCode?: string
}

interface Stats {
  totalRevenue: number
  monthlyRevenue: number
  weeklyRevenue: number
  pendingPayments: number
  refundedAmount: number
  totalTransactions: number
}

export default function PaymentsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    pendingPayments: 0,
    refundedAmount: 0,
    totalTransactions: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/payments')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      
      const data = await response.json()
      setTransactions(data.transactions || [])
      setStats(data.stats || stats)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/admin/payments/${id}`)
  }

  const handleRefund = (id: string) => {
    const transaction = transactions.find(t => t.id === id)
    if (transaction) {
      setSelectedTransaction(transaction)
      setShowRefundModal(true)
    }
  }

  const handleDownloadInvoice = (id: string) => {
    window.open(`/api/admin/payments/invoice/${id}`, '_blank')
  }

  const handleRefundConfirm = async (refundData: any) => {
    try {
      const response = await fetch(`/api/admin/payments/${selectedTransaction?.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundData)
      })

      if (!response.ok) throw new Error('Failed to process refund')
      
      setTransactions(prev => 
        prev.map(t => 
          t.id === selectedTransaction?.id 
            ? { ...t, status: 'refunded' as const }
            : t
        )
      )
      
      await fetchTransactions()
    } catch (error) {
      console.error('Error processing refund:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Financial Management</h1>
          <p className="text-gray-600">Monitor transactions, revenue, and financial analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => router.push('/admin/payments/reports')}>
            <Download className="w-4 h-4 mr-2" />
            Reports
          </Button>
          <Button onClick={() => router.push('/admin/payments/coupons')}>
            <Tag className="w-4 h-4 mr-2" />
            Manage Coupons
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Lifetime</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">+12% from last month</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">${stats.weeklyRevenue.toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-1">+8% from last week</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting processing</p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Refunded</p>
                <p className="text-2xl font-bold">${stats.refundedAmount.toLocaleString()}</p>
                <p className="text-xs text-red-600 mt-1">This month</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chart component integration needed</p>
            <p className="text-sm text-gray-500">Use recharts or chart.js</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Stripe</span>
                </div>
                <span className="text-sm font-bold">52%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '52%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium">PayPal</span>
                </div>
                <span className="text-sm font-bold">30%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Razorpay</span>
                </div>
                <span className="text-sm font-bold">18%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <TransactionTable
        transactions={transactions}
        onViewDetails={handleViewDetails}
        onRefund={handleRefund}
        onDownloadInvoice={handleDownloadInvoice}
        isLoading={isLoading}
      />

      {/* Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <RefundModal
          isOpen={showRefundModal}
          onClose={() => {
            setShowRefundModal(false)
            setSelectedTransaction(null)
          }}
          transaction={selectedTransaction}
          onConfirm={handleRefundConfirm}
        />
      )}
    </div>
  )
}