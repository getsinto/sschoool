'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Eye, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Payment {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  method: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  invoiceUrl?: string
}

interface PaymentHistoryProps {
  payments: Payment[]
  onViewDetails?: (paymentId: string) => void
  onDownloadInvoice?: (paymentId: string) => void
}

export default function PaymentHistory({ 
  payments, 
  onViewDetails,
  onDownloadInvoice 
}: PaymentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      stripe: 'bg-purple-100 text-purple-800',
      paypal: 'bg-blue-100 text-blue-800',
      razorpay: 'bg-indigo-100 text-indigo-800',
    }
    return colors[method.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDownloadInvoice = async (paymentId: string) => {
    if (onDownloadInvoice) {
      onDownloadInvoice(paymentId)
    } else {
      // Default download behavior
      try {
        const response = await fetch(`/api/payments/invoice/${paymentId}`)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${paymentId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Failed to download invoice:', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View and manage your payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {new Date(payment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.description}</div>
                        <div className="text-sm text-gray-500">ID: {payment.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPaymentMethodBadge(payment.method)}>
                        {payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onViewDetails && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onViewDetails(payment.id)}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {payment.status === 'paid' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(payment.id)}
                            title="Download invoice"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredPayments.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {filteredPayments.length} of {payments.length} payments
            </div>
            <div className="font-semibold">
              Total: {payments[0]?.currency || 'USD'}{' '}
              {filteredPayments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
