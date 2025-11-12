'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Download,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Eye,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data
const mockPaymentData = {
  summary: {
    totalSpent: 5420,
    thisMonth: 450,
    pending: 1,
    nextDueDate: '2024-02-01',
    nextDueAmount: 450
  },
  paymentHistory: [
    {
      id: '1',
      date: '2024-01-15',
      child: 'Emma Johnson',
      course: 'Advanced Mathematics',
      amount: 450,
      method: 'Credit Card',
      status: 'completed',
      invoiceUrl: '/invoices/inv-001.pdf'
    },
    {
      id: '2',
      date: '2024-01-15',
      child: 'Lucas Johnson',
      course: 'Web Development',
      amount: 400,
      method: 'Credit Card',
      status: 'completed',
      invoiceUrl: '/invoices/inv-002.pdf'
    },
    {
      id: '3',
      date: '2023-12-15',
      child: 'Emma Johnson',
      course: 'Physics 101',
      amount: 450,
      method: 'PayPal',
      status: 'completed',
      invoiceUrl: '/invoices/inv-003.pdf'
    },
    {
      id: '4',
      date: '2023-12-15',
      child: 'Emma Johnson',
      course: 'English Literature',
      amount: 420,
      method: 'Credit Card',
      status: 'completed',
      invoiceUrl: '/invoices/inv-004.pdf'
    }
  ],
  upcomingPayments: [
    {
      id: '1',
      child: 'Emma Johnson',
      course: 'Advanced Mathematics',
      amount: 450,
      dueDate: '2024-02-01',
      type: 'Monthly Subscription'
    },
    {
      id: '2',
      child: 'Lucas Johnson',
      course: 'Web Development',
      amount: 400,
      dueDate: '2024-02-01',
      type: 'Monthly Subscription'
    }
  ],
  paymentMethods: [
    {
      id: '1',
      type: 'Credit Card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'PayPal',
      email: 'sarah.johnson@example.com',
      isDefault: false
    }
  ]
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('history')
  const data = mockPaymentData

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments & Billing</h1>
          <p className="text-gray-600 mt-1">Manage payments and view billing history</p>
        </div>

        <Link href="/dashboard/parent/payments/enroll">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Enroll in Course
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${data.summary.totalSpent}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">${data.summary.thisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{data.summary.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Payment</p>
                <p className="text-2xl font-bold text-purple-600">${data.summary.nextDueAmount}</p>
                <p className="text-xs text-gray-500">{new Date(data.summary.nextDueDate).toLocaleDateString()}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        {/* Payment History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment History</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold">{payment.course}</p>
                          <p className="text-sm text-gray-600">{payment.child}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{new Date(payment.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{payment.method}</span>
                        <span>•</span>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${payment.amount}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Payments Tab */}
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-semibold">{payment.course}</p>
                          <p className="text-sm text-gray-600">{payment.child}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{payment.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${payment.amount}</p>
                      </div>
                      <Button>Pay Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Methods</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        {method.type === 'Credit Card' ? (
                          <>
                            <p className="font-semibold">{method.brand} •••• {method.last4}</p>
                            <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold">{method.type}</p>
                            <p className="text-sm text-gray-600">{method.email}</p>
                          </>
                        )}
                        {method.isDefault && (
                          <Badge variant="secondary" className="mt-1">Default</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button variant="outline" size="sm">
                          Set as Default
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
