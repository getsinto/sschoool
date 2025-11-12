'use client'

import { useState } from 'react'
import {
  FileText,
  Download,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

// Mock data
const mockReportsData = {
  children: [
    { id: '1', name: 'Emma Johnson', grade: 'Grade 10' },
    { id: '2', name: 'Lucas Johnson', grade: 'Grade 8' }
  ],
  recentReports: [
    {
      id: '1',
      type: 'Monthly Performance Report',
      child: 'Emma Johnson',
      period: 'January 2024',
      generatedDate: '2024-02-01',
      status: 'completed',
      fileUrl: '/reports/emma-jan-2024.pdf'
    },
    {
      id: '2',
      type: 'Weekly Progress Report',
      child: 'Lucas Johnson',
      period: 'Week of Jan 15-21, 2024',
      generatedDate: '2024-01-22',
      status: 'completed',
      fileUrl: '/reports/lucas-week3-2024.pdf'
    },
    {
      id: '3',
      type: 'Term Report',
      child: 'Emma Johnson',
      period: 'Fall 2023',
      generatedDate: '2023-12-20',
      status: 'completed',
      fileUrl: '/reports/emma-fall-2023.pdf'
    }
  ]
}

export default function ReportsPage() {
  const [selectedChild, setSelectedChild] = useState('1')
  const [reportType, setReportType] = useState('monthly')
  const [includeSections, setIncludeSections] = useState({
    performance: true,
    attendance: true,
    behavior: true,
    teacherComments: true,
    recommendations: true
  })
  const data = mockReportsData

  const handleGenerateReport = () => {
    console.log('Generating report:', {
      child: selectedChild,
      type: reportType,
      sections: includeSections
    })
    // API call to generate report
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-700">Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress Reports</h1>
        <p className="text-gray-600 mt-1">Generate and download academic progress reports</p>
      </div>

      {/* Generate New Report */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Child Selection */}
            <div className="space-y-2">
              <Label>Select Child</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name} - {child.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Progress Report</SelectItem>
                  <SelectItem value="monthly">Monthly Performance Report</SelectItem>
                  <SelectItem value="term">Term/Semester Report</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Include Sections */}
          <div>
            <Label className="mb-3 block">Include Sections:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="performance"
                  checked={includeSections.performance}
                  onCheckedChange={(checked) =>
                    setIncludeSections({ ...includeSections, performance: checked as boolean })
                  }
                />
                <Label htmlFor="performance" className="cursor-pointer">
                  Academic Performance
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attendance"
                  checked={includeSections.attendance}
                  onCheckedChange={(checked) =>
                    setIncludeSections({ ...includeSections, attendance: checked as boolean })
                  }
                />
                <Label htmlFor="attendance" className="cursor-pointer">
                  Attendance Summary
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="behavior"
                  checked={includeSections.behavior}
                  onCheckedChange={(checked) =>
                    setIncludeSections({ ...includeSections, behavior: checked as boolean })
                  }
                />
                <Label htmlFor="behavior" className="cursor-pointer">
                  Behavior Notes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="teacherComments"
                  checked={includeSections.teacherComments}
                  onCheckedChange={(checked) =>
                    setIncludeSections({ ...includeSections, teacherComments: checked as boolean })
                  }
                />
                <Label htmlFor="teacherComments" className="cursor-pointer">
                  Teacher Comments
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={includeSections.recommendations}
                  onCheckedChange={(checked) =>
                    setIncludeSections({ ...includeSections, recommendations: checked as boolean })
                  }
                />
                <Label htmlFor="recommendations" className="cursor-pointer">
                  Recommendations
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleGenerateReport} className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Auto-Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{report.type}</p>
                    <p className="text-sm text-gray-600">{report.child}</p>
                    <p className="text-xs text-gray-500">
                      {report.period} • Generated {new Date(report.generatedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(report.status)}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No scheduled reports configured</p>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Set Up Auto-Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
