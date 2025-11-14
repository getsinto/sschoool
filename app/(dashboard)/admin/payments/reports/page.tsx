'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CreditCard,
  Calendar,
  BarChart3
} from 'lucide-react'

export default function PaymentReportsPage() {
  const [reportType, setReportType] = useState('revenue')
  const [timePeriod, setTimePeriod] = useState('month')

  const reports = [
    { id: 'revenue', name: 'Revenue by Course', icon: DollarSign },
    { id: 'gateway', name: 'Revenue by Gateway', icon: CreditCard },
    { id: 'performance', name: 'Top Performing Courses', icon: TrendingUp },
    { id: 'lifetime', name: 'Student Lifetime Value', icon: Users },
    { id: 'coupons', name: 'Coupon Effectiveness', icon: BarChart3 },
    { id: 'refunds', name: 'Refund Rate Analysis', icon: Calendar }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Generate and export financial reports</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reports.map(report => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">Generate</Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(report => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="w-5 h-5" />
                  <span>{report.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  View detailed {report.name.toLowerCase()} analytics
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Report
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Report</h3>
          <p className="text-gray-600">Choose a report type and time period to view analytics</p>
        </CardContent>
      </Card>
    </div>
  )
}
