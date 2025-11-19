'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, Download } from 'lucide-react'

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('')
  const [selectedChild, setSelectedChild] = useState('')
  const [sections, setSections] = useState({
    performance: true,
    attendance: true,
    behavior: false,
    teacherComments: true,
    recommendations: true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Progress Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly Progress Report</SelectItem>
              <SelectItem value="monthly">Monthly Performance Report</SelectItem>
              <SelectItem value="semester">Term/Semester Report</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Select Child</Label>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a child" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Alice Johnson</SelectItem>
              <SelectItem value="2">Bob Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-3 block">Include Sections</Label>
          <div className="space-y-2">
            {Object.entries(sections).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) =>
                    setSections({ ...sections, [key]: checked as boolean })
                  }
                />
                <label htmlFor={key} className="text-sm capitalize cursor-pointer">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full" disabled={!reportType || !selectedChild}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </CardContent>
    </Card>
  )
}
