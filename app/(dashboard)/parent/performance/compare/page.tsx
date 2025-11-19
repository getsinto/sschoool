'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TrendingUp, TrendingDown, Award, Clock, Target, Download } from 'lucide-react'
import Link from 'next/link'

// Mock data
const mockChildren = [
  {
    id: '1',
    name: 'Alice Johnson',
    grade: 'Grade 10',
    overallGPA: 3.8,
    attendance: 95,
    studyTime: 120,
    strengths: ['Mathematics', 'Science'],
    needsAttention: ['History']
  },
  {
    id: '2',
    name: 'Bob Johnson',
    grade: 'Grade 8',
    overallGPA: 3.5,
    attendance: 88,
    studyTime: 90,
    strengths: ['English', 'Art'],
    needsAttention: ['Mathematics', 'Science']
  }
]

export default function ComparePerformancePage() {
  const [selectedChildren, setSelectedChildren] = useState<string[]>(['1', '2'])

  const children = mockChildren.filter(c => selectedChildren.includes(c.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/parent/performance">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Compare Performance</h1>
            <p className="text-muted-foreground">Side-by-side comparison of your children</p>
          </div>
        </div>
      </div>

      {/* Child Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Children to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {mockChildren.map(child => (
              <Button
                key={child.id}
                variant={selectedChildren.includes(child.id) ? 'default' : 'outline'}
                onClick={() => {
                  if (selectedChildren.includes(child.id)) {
                    setSelectedChildren(selectedChildren.filter(id => id !== child.id))
                  } else {
                    setSelectedChildren([...selectedChildren, child.id])
                  }
                }}
              >
                {child.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Grid */}
      {children.length >= 2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map(child => (
            <Card key={child.id}>
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center justify-between">
                  <span>{child.name}</span>
                  <Badge>{child.grade}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Overall GPA */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall GPA</span>
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{child.overallGPA}</div>
                </div>

                {/* Attendance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Attendance Rate</span>
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold">{child.attendance}%</div>
                </div>

                {/* Study Time */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Weekly Study Time</span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold">{child.studyTime} min</div>
                </div>

                {/* Strengths */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold">Strengths</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {child.strengths.map((strength, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-50">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Needs Attention */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold">Needs Attention</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {child.needsAttention.map((subject, idx) => (
                      <Badge key={idx} variant="outline" className="bg-orange-50">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Select at least 2 children to compare</p>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      {children.length >= 2 && (
        <div className="flex justify-end">
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Comparison Report
          </Button>
        </div>
      )}
    </div>
  )
}
