'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import InvoiceGenerator from '@/components/admin/payments/InvoiceGenerator'
import RefundModal from '@/components/admin/payments/RefundModal'
import { 
  ArrowLeft, 
  CreditCard, 
  User, 
  BookOpen, 
  RefreshCw,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface PaymentDetails {
  id: string
  transactionId: string
  invoiceNumber: string
  studentId: string
  studentName: string
  studentEmail: string
  studentAddress?: string
  courseId: string
  courseName: string
  coursePrice: number
  discount: number
  couponCode?: string
  subtotal: number
  tax: number
  total: number
  currency: string
  gateway: string
  gatewayTransactionId: string
  status: string
  date: string
  gatewayResponse: any
}

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showRefundModal, setShowRefundModal] = useState(false)

  useEffect(() => {
    fetchPaymentDetails()
  }, [params.id])

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/admin/payments/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch payment details')
      
      const data = await response.json()
      setPayment(data.transaction)
    } catch (error) {
      console.error('Error fetching payment details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return <Badge className={styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}>{status}</Badge>
  }

  const handleRefundConfirm = async (refundData: any) => {
    try {
      const response = await fetch(`/api/admin/payments/${params.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundData)
      })

      if (!response.ok) throw new Error('Failed to process refund')
      
      if (payment) {
        setPayment({ ...payment, status: 'refunded' })
      }
      
      setShowRefundModal(false)
    } catch (error) {
      console.error('Error processing refund:', error)
      throw error
    }
  }

  const handleDownloadInvoice = () => {
    window.open(`/api/admin/payments/invoice/${params.id}`, '_blank')
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  const handleEmailInvoice = async () => {
    try {
      const response = await fetch(`/api/admin/payments/invoice/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payment?.studentEmail })
      })

      if (!response.ok) throw new Error('Failed to send invoice')
    } catch (error) {
      console.error('Error sending invoice:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Not Found</h3>
          <p className="text-gray-600 mb-4">The payment you're looking for doesn't exist.</p>
          <Link href="/admin/payments">
            <Button>Back to Payments</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/payments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payments
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
            <p className="text-gray-600">{payment.transactionId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {payment.status === 'completed' && (
            <Button variant="outline" onClick={() => setShowRefundModal(true)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Process Refund
            </Button>
          )}
          {getStatusBadge(payment.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="font-mono text-sm">{payment.transactionId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Invoice Number</label>
                  <p className="font-mono text-sm">{payment.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm">{new Date(payment.date).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gateway</label>
                  <p className="text-sm capitalize">{payment.gateway}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Student Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm">{payment.studentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm">{payment.studentEmail}</p>
              </div>
              {payment.studentAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-sm">{payment.studentAddress}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Course Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-700">Course</label>
                <p className="text-sm">{payment.courseName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Course Price:</span>
                <span>{payment.currency} {payment.coursePrice.toFixed(2)}</span>
              </div>
              {payment.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {payment.couponCode && `(${payment.couponCode})`}:</span>
                  <span>-{payment.currency} {payment.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{payment.currency} {payment.subtotal.toFixed(2)}</span>
              </div>
              {payment.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{payment.currency} {payment.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{payment.currency} {payment.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Gateway Response */}
          <Card>
            <CardHeader>
              <CardTitle>Gateway Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(payment.gatewayResponse, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Generator */}
          <InvoiceGenerator
            invoice={{
              invoiceNumber: payment.invoiceNumber,
              transactionId: payment.transactionId,
              date: payment.date,
              studentName: payment.studentName,
              studentEmail: payment.studentEmail,
              studentAddress: payment.studentAddress,
              courseName: payment.courseName,
              coursePrice: payment.coursePrice,
              discount: payment.discount,
              couponCode: payment.couponCode,
              subtotal: payment.subtotal,
              tax: payment.tax,
              total: payment.total,
              currency: payment.currency,
              gateway: payment.gateway,
              status: payment.status
            }}
            onDownload={handleDownloadInvoice}
            onPrint={handlePrintInvoice}
            onEmail={handleEmailInvoice}
          />
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <RefundModal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          transaction={{
            id: payment.id,
            transactionId: payment.transactionId,
            studentName: payment.studentName,
            courseName: payment.courseName,
            amount: payment.total,
            currency: payment.currency,
            gateway: payment.gateway
          }}
          onConfirm={handleRefundConfirm}
        />
      )}
    </div>
  )
}