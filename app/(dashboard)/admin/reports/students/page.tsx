'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Download,
  BookOpen,
  CheckCircle,
  Clock
} from 'lucide-react'
import StudentReportTable from '@/components/admin/reports/StudentReportTable'

interface StudentReportData {
  metrics: {
    totalEnrollments: number
    activeStudents: number
    completionRate: number
    averageScore: number
    submissionRate: number
    atRiskStudents: number
  }
  performanceTrend: Array<{
    period: string
    averageScore: number
    completionRate: number
    activeStudents: number
  }>
  gradeDistribution: Array<{
    grade: string
    count: number
    percentage: number
  }>
  topPerformers: Array<{
    studentId: string
    name: string
    grade: string
    averageScore: number
    completedCourses: number
  }>
  atRiskStudents: Array<{
    studentId: string
    name: string
    grade: string
    averageScore: number
    completionRate: number
    lastActivity: string
    riskFactors: string[]
  }>
}

export default function StudentReportsPage() {
  const [reportData, setReportData] = useState<StudentReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [gradeFilter, setGradeFilter] = useState('all')

  useEffect(() => {
    fetchStudentReports()
  }, [dateRange, gradeFilter])

  const fetchStudentReports = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (gradeFilter !== 'all') params.append('grade', gradeFilter)
      
      const response = await fetch(`/api/admin/reports/students?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error fetching student reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/reports/students?format=pdf')
      if (response.ok) {
        const data = await response.json()
        alert(`Report exported: ${data.fileName}`)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const handleViewDetails = (studentId: string) => {
    console.log('View student details:', studentId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load student reports</p>
      </div>
    )
  }

  const studentTableData = [
    ...reportData.topPerformers.map(s => ({
      id: s.studentId,
      name: s.name,
      grade: s.grade,
      coursesEnrolled: s.completedCourses + 1,
      completionRate: 95,
      averageScore: s.averageScore,
      status: 'active' as const
    })),
    ...reportData.atRiskStudents.map(s => ({
      id: s.studentId,
      name: s.name,
      grade: s.grade,
      coursesEnrolled: Math.floor(Math.random() * 5) + 2,
      completionRate: s.completionRate,
      averageScore: s.averageScore,
      status: 'inactive' as const
    }))
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Performance Reports</h1>
          <p className="text-gray-600">Comprehensive student analytics and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="9">Grade 9</SelectItem>
              <SelectItem value="10">Grade 10</SelectItem>
              <SelectItem value="11">Grade 11</SelectItem>
              <SelectItem value="12">Grade 12</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold">{reportData.metrics.totalEnrollments}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold">{reportData.metrics.activeStudents}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{reportData.metrics.completionRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{reportData.metrics.averageScore.toFixed(1)}%</p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submission Rate</p>
                <p className="text-2xl font-bold">{reportData.metrics.submissionRate.toFixed(1)}%</p>
              </div>
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-2xl font-bold">{reportData.metrics.atRiskStudents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.performanceTrend.slice(-6).map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{trend.period}</span>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <span className="text-gray-600">Avg Score: </span>
                    <span className="font-medium">{trend.averageScore.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Completion: </span>
                    <span className="font-medium">{trend.completionRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Active: </span>
                    <span className="font-medium">{trend.activeStudents}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.gradeDistribution.map((grade, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-32 text-sm font-medium">{grade.grade}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2" 
                      style={{ width: `${grade.percentage}%` }}
                    >
                      <span className="text-xs text-white font-medium">{grade.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-600 text-right">{grade.count} students</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.topPerformers.map((student, index) => (
              <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.grade}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">{student.averageScore.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Average Score</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{student.completedCourses}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Students At Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.atRiskStudents.map((student) => (
              <div key={student.studentId} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.grade}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">At Risk</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
                  <div>
                    <span className="text-gray-600">Avg Score: </span>
                    <span className="font-medium">{student.averageScore.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Completion: </span>
                    <span className="font-medium">{student.completionRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Active: </span>
                    <span className="font-medium">{new Date(student.lastActivity).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.riskFactors.map((factor, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentReportTable 
            students={studentTableData}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>
    </div>
  )
}