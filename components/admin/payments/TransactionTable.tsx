'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Download, 
  Eye, 
  RefreshCw, 
  FileText,
  Filter
} from 'lucide-react'

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

interface TransactionTableProps {
  transactions: Transaction[]
  onViewDetails: (id: string) => void
  onRefund: (id: string) => void
  onDownloadInvoice: (id: string) => void
  isLoading?: boolean
}

export default function TransactionTable({
  transactions,
  onViewDetails,
  onRefund,
  onDownloadInvoice,
  isLoading = false
}: TransactionTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  const getGatewayBadge = (gateway: string) => {
    const styles = {
      stripe: 'bg-purple-100 text-purple-800',
      paypal: 'bg-blue-100 text-blue-800',
      razorpay: 'bg-indigo-100 text-indigo-800'
    }
    return <Badge variant="outline" className={styles[gateway as keyof typeof styles]}>{gateway}</Badge>
  }

  const filteredTransactions = transactions
    .filter(t => 
      (t.transactionId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (t.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (t.courseName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        const comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        return sortOrder === 'asc' ? comparison : -comparison
      } else {
        const comparison = a.amount - b.amount
        return sortOrder === 'asc' ? comparison : -comparison
      }
    })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading transactions...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by transaction ID, student, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Transaction ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Gateway</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? 'No transactions found' : 'No transactions yet'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{transaction.transactionId}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{transaction.studentName}</p>
                        <p className="text-xs text-gray-500">{transaction.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{transaction.courseName}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {transaction.currency} {transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{getGatewayBadge(transaction.gateway)}</td>
                    <td className="px-4 py-3">{getStatusBadge(transaction.status)}</td>
                    <td className="px-4 py-3 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => onViewDetails(transaction.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDownloadInvoice(transaction.id)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                        {transaction.status === 'completed' && (
                          <Button size="sm" variant="ghost" onClick={() => onRefund(transaction.id)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
