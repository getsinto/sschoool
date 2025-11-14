'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RefreshCw, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'

interface RefundRequest {
  id: string
  transactionId: string
  studentName: string
  courseName: string
  amount: number
  currency: string
  reason: string
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'processed'
  processedAt?: string
  processedBy?: string
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRefunds()
  }, [statusFilter])

  const fetchRefunds = async () => {
    try {
      // Mock data
      setRefunds([
        {
          id: '1',
          transactionId: 'TXN001',
          studentName: 'John Doe',
          courseName: 'Mathematics Grade 10',
          amount: 99.99,
          currency: 'USD',
          reason: 'Course not as expected',
          requestedAt: '2024-01-15T10:00:00Z',
          status: 'pending'
        }
      ])
    } catch (error) {
      console.error('Error fetching refunds:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      processed: 'bg-green-100 text-green-800'
    }
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  const filteredRefunds = refunds.filter(r =>
    (statusFilter === 'all' || r.status === statusFilter) &&
    ((r.transactionId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
     (r.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
  )

  const stats = {
    pending: refunds.filter(r => r.status === 'pending').length,
    processed: refunds.filter(r => r.status === 'processed').length,
    totalAmount: refunds.reduce((sum, r) => sum + r.amount, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Refund Management</h1>
        <p className="text-gray-600">Manage refund requests and history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold">{stats.processed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">USD {stats.totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by transaction ID or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{refund.transactionId}</td>
                    <td className="px-4 py-3 text-sm">{refund.studentName}</td>
                    <td className="px-4 py-3 text-sm">{refund.courseName}</td>
                    <td className="px-4 py-3 text-sm font-medium">{refund.currency} {refund.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{refund.reason}</td>
                    <td className="px-4 py-3">{getStatusBadge(refund.status)}</td>
                    <td className="px-4 py-3">
                      {refund.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
