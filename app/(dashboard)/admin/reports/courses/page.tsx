'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Download, 
  TrendingUp, 
  Users, 
  Star,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface CourseAnalytics {
  id: string
  courseName: string
  totalEnrollments: number
  completionRate: number
  averageRating: number
  revenueGenerated: number
  watchTime: number
  dropOffRate: number
  engagementScore: number
}

export default function CourseAnalyticsPage() {
  const [courses, setCourses] = useState<CourseAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('enrollments')

  useEffect(() => {
    fetchCourseAnalytics()
  }, [])

  const fetchCourseAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/reports/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Error fetching course analytics:', error)
      // Mock data
      setCourses([
        {
          id: '1',
          courseName: 'Mathematics Grade 10',
          totalEnrollments: 245,
          completionRate: 78.5,
          averageRating: 4.6,
          revenueGenerated: 24500,
          watchTime: 1250,
          dropOffRate: 15.2,
          engagementScore: 85
        },
        {
          id: '2',
          courseName: 'Physics Grade 11',
          totalEnrollments: 189,
          completionRate: 72.3,
          averageRating: 4.4,
          revenueGenerated: 18900,
          watchTime: 980,
          dropOffRate: 18.5,
          engagementScore: 78
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    totalCourses: courses.length,
    avgCompletionRate: courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length || 0,
    totalRevenue: courses.reduce((sum, c) => sum + c.revenueGenerated, 0),
    avgRating: courses.reduce((sum, c) => sum + c.averageRating, 0) / courses.length || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Analytics</h1>
          <p className="text-gray-600">Comprehensive course performance metrics</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold">{stats.avgCompletionRate.toFixed(1)}%</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrollments">Most Enrollments</SelectItem>
                <SelectItem value="completion">Highest Completion</SelectItem>
                <SelectItem value="revenue">Highest Revenue</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Course Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Course Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Enrollments</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Completion</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Watch Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Drop-off</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{course.courseName}</td>
                    <td className="px-4 py-3 text-sm">{course.totalEnrollments}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className={course.completionRate >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {course.completionRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {course.averageRating.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">${course.revenueGenerated.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {course.watchTime}h
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className={course.dropOffRate <= 20 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {course.dropOffRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${course.engagementScore}%` }}
                          ></div>
                        </div>
                        <span>{course.engagementScore}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Course Comparison Chart</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chart visualization with Recharts</p>
          <p className="text-sm text-gray-500">Install: npm install recharts</p>
        </CardContent>
      </Card>
    </div>
  )
}
