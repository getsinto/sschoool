'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  Activity,
  GraduationCap,
  Settings,
  TrendingUp,
  Calendar,
  FileText,
  Clock
} from 'lucide-react'
import ReportCard from '@/components/admin/reports/ReportCard'

interface DashboardStats {
  students: {
    total: number
    active: number
    atRisk: number
  }
  financial: {
    totalRevenue: number
    monthlyRevenue: number
    growth: number
  }
  courses: {
    total: number
    avgCompletion: number
    avgRating: number
  }
  teachers: {
    total: number
    active: number
    avgRating: number
  }
}

interface RecentReport {
  id: string
  name: string
  type: string
  generatedAt: string
  generatedBy: string
}

interface ScheduledReport {
  id: string
  name: string
  frequency: string
  nextRun: string
  status: 'active' | 'paused'
}

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch data from multiple endpoints
      const [studentsRes, financialRes, coursesRes, teachersRes, scheduledRes] = await Promise.all([
        fetch('/api/admin/reports/students'),
        fetch('/api/admin/reports/financial'),
        fetch('/api/admin/reports/courses'),
        fetch('/api/admin/reports/teachers'),
        fetch('/api/admin/reports/schedule')
      ])

      if (studentsRes.ok && financialRes.ok && coursesRes.ok && teachersRes.ok) {
        const studentsData = await studentsRes.json()
        const financialData = await financialRes.json()
        const coursesData = await coursesRes.json()
        const teachersData = await teachersRes.json()
        const scheduledData = scheduledRes.ok ? await scheduledRes.json() : { scheduledReports: [] }

        setStats({
          students: {
            total: studentsData.data?.metrics?.totalEnrollments || 2450,
            active: studentsData.data?.metrics?.activeStudents || 1890,
            atRisk: studentsData.data?.metrics?.atRiskStudents || 156
          },
          financial: {
            totalRevenue: financialData.data?.metrics?.totalRevenue || 485750,
            monthlyRevenue: financialData.data?.metrics?.monthlyRevenue || 52340,
            growth: 5.2
          },
          courses: {
            total: coursesData.courses?.length || 12,
            avgCompletion: 78.5,
            avgRating: 4.6
          },
          teachers: {
            total: teachersData.teachers?.length || 24,
            active: 22,
            avgRating: 4.7
          }
        })

        setScheduledReports(scheduledData.scheduledReports || [])
        
        // Mock recent reports
        setRecentReports([
          {
            id: '1',
            name: 'Student Performance Q1',
            type: 'Students',
            generatedAt: new Date().toISOString(),
            generatedBy: 'Admin User'
          },
          {
            id: '2',
            name: 'Monthly Financial Summary',
            type: 'Financial',
            generatedAt: new Date(Date.now() - 86400000).toISOString(),
            generatedBy: 'Admin User'
          },
          {
            id: '3',
            name: 'Course Analytics Report',
            type: 'Courses',
            generatedAt: new Date(Date.now() - 172800000).toISOString(),
            generatedBy: 'Admin User'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = (type: string) => {
    console.log('Generate report:', type)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive reporting and analytics for your platform</p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{stats.students.total}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.students.active} active
                  </p>
                </div>
                <Users className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${(stats.financial.totalRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-600 mt-1">
                    +{stats.financial.growth}% growth
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold">{stats.courses.total}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.courses.avgCompletion}% avg completion
                  </p>
                </div>
                <BookOpen className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Teachers</p>
                  <p className="text-2xl font-bold">{stats.teachers.active}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {stats.teachers.avgRating}⭐ avg rating
                  </p>
                </div>
                <GraduationCap className="w-10 h-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/reports/students">
            <ReportCard
              title="Student Performance"
              description="Enrollment, completion rates, and performance metrics"
              icon={Users}
              lastGenerated={recentReports.find(r => r.type === 'Students')?.generatedAt}
              onGenerate={() => handleGenerateReport('students')}
            />
          </Link>

          <Link href="/admin/reports/financial">
            <ReportCard
              title="Financial Reports"
              description="Revenue, transactions, and payment analytics"
              icon={DollarSign}
              lastGenerated={recentReports.find(r => r.type === 'Financial')?.generatedAt}
              onGenerate={() => handleGenerateReport('financial')}
            />
          </Link>

          <Link href="/admin/reports/courses">
            <ReportCard
              title="Course Analytics"
              description="Course performance, enrollments, and ratings"
              icon={BookOpen}
              lastGenerated={recentReports.find(r => r.type === 'Courses')?.generatedAt}
              onGenerate={() => handleGenerateReport('courses')}
            />
          </Link>

          <Link href="/admin/reports/users">
            <ReportCard
              title="User Activity"
              description="User engagement, sessions, and retention"
              icon={Activity}
              onGenerate={() => handleGenerateReport('users')}
            />
          </Link>

          <Link href="/admin/reports/teachers">
            <ReportCard
              title="Teacher Performance"
              description="Teaching metrics, ratings, and engagement"
              icon={GraduationCap}
              onGenerate={() => handleGenerateReport('teachers')}
            />
          </Link>

          <Link href="/admin/reports/custom">
            <ReportCard
              title="Custom Reports"
              description="Build custom reports with your own metrics"
              icon={Settings}
              onGenerate={() => handleGenerateReport('custom')}
            />
          </Link>
        </div>
      </div>

      {/* Recent Reports & Scheduled Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{report.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">{report.type}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(report.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent reports</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Scheduled Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledReports.length > 0 ? (
                scheduledReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{report.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">{report.frequency}</Badge>
                        <span className="text-xs text-gray-500">
                          Next: {new Date(report.nextRun).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge className={report.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {report.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No scheduled reports</p>
                  <Link href="/admin/reports/custom">
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Schedule a Report
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/reports/custom">
              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Build Custom Report</p>
              </button>
            </Link>
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Schedule Report</p>
            </button>
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Export All Data</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}