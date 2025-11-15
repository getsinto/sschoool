'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  AlertCircle,
  Download,
  Calendar,
  Percent,
  RefreshCw
} from 'lucide-react'
import RevenueChart from '@/components/admin/reports/RevenueChart'

interface FinancialReportData {
  metrics: {
    totalRevenue: number
    monthlyRevenue: number
    weeklyRevenue: number
    dailyRevenue: number
    averageTransactionValue: number
    totalTransactions: number
    successRate: number
    refundRate: number
    outstandingPayments: number
  }
  revenueTrend: Array<{
    period: string
    revenue: number
    transactions: number
    growth: number
  }>
  revenueByGateway: Array<{
    gateway: string
    revenue: number
    transactions: number
    successRate: number
    fees: number
    marketShare: number
  }>
  revenueByCourse: Array<{
    courseId: string
    courseName: string
    revenue: number
    enrollments: number
    averagePrice: number
    refunds: number
    netRevenue: number
  }>
  paymentAnalysis: {
    successfulPayments: number
    failedPayments: number
    refundedPayments: number
    chargebackRate: number
  }
  couponAnalytics: Array<{
    code: string
    usage: number
    discountAmount: number
    roi: number
    revenueImpact: number
  }>
  forecast: {
    nextMonth: number
    nextQuarter: number
    confidence: number
    growthRate: number
  }
}

export default function FinancialReportsPage() {
  const [reportData, setReportData] = useState<FinancialReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('monthly')
  const [gateway, setGateway] = useState('all')

  useEffect(() => {
    fetchFinancialReports()
  }, [period, gateway])

  const fetchFinancialReports = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ period })
      if (gateway !== 'all') params.append('gateway', gateway)
      
      const response = await fetch(`/api/admin/reports/financial?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error fetching financial reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/reports/financial?format=pdf')
      if (response.ok) {
        const data = await response.json()
        alert(`Report exported: ${data.fileName}`)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load financial reports</p>
      </div>
    )
  }

  const revenueChartData = reportData.revenueTrend.map(trend => ({
    date: trend.period,
    revenue: trend.revenue,
    transactions: trend.transactions,
    averageValue: trend.revenue / trend.transactions
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Comprehensive revenue and transaction analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gateway} onValueChange={setGateway}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gateways</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="razorpay">Razorpay</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${reportData.metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${reportData.metrics.monthlyRevenue.toLocaleString()}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold">${reportData.metrics.averageTransactionValue.toFixed(2)}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{reportData.metrics.successRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Total Transactions</p>
            <p className="text-lg font-bold">{reportData.metrics.totalTransactions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Weekly Revenue</p>
            <p className="text-lg font-bold">${reportData.metrics.weeklyRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Daily Revenue</p>
            <p className="text-lg font-bold">${reportData.metrics.dailyRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Refund Rate</p>
            <p className="text-lg font-bold">{reportData.metrics.refundRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Outstanding</p>
            <p className="text-lg font-bold">${reportData.metrics.outstandingPayments.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={revenueChartData} title="Revenue Trend" />

      {/* Revenue by Gateway */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Payment Gateway</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.revenueByGateway.map((gateway, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{gateway.gateway}</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {gateway.marketShare.toFixed(1)}% share
                    </Badge>
                  </div>
                  <span className="text-lg font-bold">${gateway.revenue.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Transactions: </span>
                    <span className="font-medium">{gateway.transactions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Success Rate: </span>
                    <span className="font-medium">{gateway.successRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fees: </span>
                    <span className="font-medium">${gateway.fees.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Net: </span>
                    <span className="font-medium">${(gateway.revenue - gateway.fees).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Course */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Enrollments</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Avg Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Refunds</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Net Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.revenueByCourse.map((course) => (
                  <tr key={course.courseId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{course.courseName}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      ${course.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{course.enrollments}</td>
                    <td className="px-4 py-3 text-sm">${course.averagePrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className="bg-red-100 text-red-800">{course.refunds}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ${course.netRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">Successful Payments</span>
                </div>
                <span className="font-bold">{reportData.paymentAnalysis.successfulPayments}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm font-medium">Failed Payments</span>
                </div>
                <span className="font-bold">{reportData.paymentAnalysis.failedPayments}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Refunded Payments</span>
                </div>
                <span className="font-bold">{reportData.paymentAnalysis.refundedPayments}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Chargeback Rate</span>
                </div>
                <span className="font-bold">{reportData.paymentAnalysis.chargebackRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Next Month Forecast</span>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  ${reportData.forecast.nextMonth.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {reportData.forecast.confidence.toFixed(1)}% confidence
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900">Next Quarter Forecast</span>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  ${reportData.forecast.nextQuarter.toLocaleString()}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  {reportData.forecast.growthRate.toFixed(1)}% growth rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupon Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Discount Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">ROI</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Revenue Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.couponAnalytics.map((coupon, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      <Badge variant="outline">{coupon.code}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{coupon.usage}</td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      -${coupon.discountAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className={coupon.roi >= 2 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {coupon.roi.toFixed(1)}x
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={coupon.revenueImpact < 0 ? 'text-red-600' : 'text-green-600'}>
                        {coupon.revenueImpact.toFixed(2)}%
                      </span>
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