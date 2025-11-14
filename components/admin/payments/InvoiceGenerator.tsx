'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Printer, Mail } from 'lucide-react'

interface InvoiceData {
  invoiceNumber: string
  transactionId: string
  date: string
  studentName: string
  studentEmail: string
  studentAddress?: string
  courseName: string
  coursePrice: number
  discount: number
  couponCode?: string
  subtotal: number
  tax: number
  total: number
  currency: string
  gateway: string
  status: string
}

interface InvoiceGeneratorProps {
  invoice: InvoiceData
  onDownload: () => void
  onPrint: () => void
  onEmail: () => void
}

export default function InvoiceGenerator({ invoice, onDownload, onPrint, onEmail }: InvoiceGeneratorProps) {
  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center space-x-2">
        <Button onClick={onDownload} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button onClick={onPrint} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button onClick={onEmail} variant="outline" size="sm">
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
      </div>

      {/* Invoice Preview */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-sm text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">Your School</p>
                <p className="text-sm text-gray-600 mt-1">123 Education Street</p>
                <p className="text-sm text-gray-600">City, State 12345</p>
                <p className="text-sm text-gray-600">contact@yourschool.com</p>
              </div>
            </div>

            {/* Bill To & Invoice Details */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">BILL TO:</h3>
                <p className="font-medium">{invoice.studentName}</p>
                <p className="text-sm text-gray-600">{invoice.studentEmail}</p>
                {invoice.studentAddress && (
                  <p className="text-sm text-gray-600">{invoice.studentAddress}</p>
                )}
              </div>
              <div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Invoice Date:</span>
                    <span className="font-medium">{new Date(invoice.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs">{invoice.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">{invoice.gateway}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium capitalize text-green-600">{invoice.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3">
                      <p className="font-medium">{invoice.courseName}</p>
                      <p className="text-sm text-gray-600">Course Enrollment</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {invoice.currency} {invoice.coursePrice.toFixed(2)}
                    </td>
                  </tr>
                  {invoice.discount > 0 && (
                    <tr>
                      <td className="px-4 py-3">
                        <p className="font-medium text-green-600">Discount</p>
                        {invoice.couponCode && (
                          <p className="text-sm text-gray-600">Coupon: {invoice.couponCode}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">
                        -{invoice.currency} {invoice.discount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{invoice.currency} {invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{invoice.currency} {invoice.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{invoice.currency} {invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 text-center text-sm text-gray-600">
              <p>Thank you for your purchase!</p>
              <p className="mt-2">For questions about this invoice, please contact support@yourschool.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
