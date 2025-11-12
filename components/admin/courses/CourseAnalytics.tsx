'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Eye,
  Clock,
  TrendingDown,
  Users,
  Play,
  BookOpen
} from 'lucide-react'

interface CourseAnalyticsProps {
  course: {
    analytics: {
      views: number
      watchTime: number
      dropOffPoints: Array<{
        lessonId: string
        lessonTitle: string
        dropOffRate: number
      }>
      enrollmentTrend: Array<{
        date: string
        enrollments: number
      }>
    }
    enrollments: number
    completionRate: number
  }
}

export default function CourseAnalytics({ course }: CourseAnalyticsProps) {
  // Mock additional analytics data
  const viewsData = [
    { date: '2024-01-16', views: 45, uniqueViews: 38 },
    { date: '2024-01-17', views: 67, uniqueViews: 52 },
    { date: '2024-01-18', views: 89, uniqueViews: 71 },
    { date: '2024-01-19', views: 156, uniqueViews: 124 },
    { date: '2024-01-20', views: 245, uniqueViews: 198 }
  ]

  const engagementData = [
    { lesson: 'Lesson 1', completion: 89, avgTime: 14.5 },
    { lesson: 'Lesson 2', completion: 85, avgTime: 18.2 },
    { lesson: 'Lesson 3', completion: 78, avgTime: 8.7 },
    { lesson: 'Lesson 4', completion: 76, avgTime: 22.1 },
    { lesson: 'Lesson 5', completion: 72, avgTime: 26.8 },
    { lesson: 'Lesson 6', completion: 65, avgTime: 35.2 }
  ]

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#3B82F6' },
    { name: 'Mobile', value: 35, color: '#10B981' },
    { name: 'Tablet', value: 20, color: '#F59E0B' }
  ]

  const timeSpentData = [
    { hour: '6AM', students: 5 },
    { hour: '8AM', students: 15 },
    { hour: '10AM', students: 25 },
    { hour: '12PM', students: 35 },
    { hour: '2PM', students: 45 },
    { hour: '4PM', students: 55 },
    { hour: '6PM', students: 65 },
    { hour: '8PM', students: 75 },
    { hour: '10PM', students: 45 },
    { hour: '12AM', students: 15 }
  ]

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">{course.analytics.views.toLocaleString()}</p>
                <p className="text-sm text-gray-500">+12% this week</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Watch Time</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(course.analytics.watchTime / 60)}h
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round(course.analytics.watchTime / course.enrollments)} min/student
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{course.completionRate}%</p>
                <p className="text-sm text-gray-500">Above average</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Drop-off</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(course.analytics.dropOffPoints.reduce((sum, point) => sum + point.dropOffRate, 0) / course.analytics.dropOffPoints.length)}%
                </p>
                <p className="text-sm text-gray-500">Needs attention</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={course.analytics.enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Enrollments']} />
                <Area 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Views Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Views & Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Total Views"
                />
                <Line 
                  type="monotone" 
                  dataKey="uniqueViews" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Unique Views"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesson Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lesson" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                <Bar dataKey="completion" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Points */}
      <Card>
        <CardHeader>
          <CardTitle>High Drop-off Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {course.analytics.dropOffPoints.map((point, index) => (
              <div key={point.lessonId} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <h4 className="font-medium text-gray-900">{point.lessonTitle}</h4>
                  <p className="text-sm text-gray-600">Students dropping off at this lesson</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{point.dropOffRate}%</div>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    High Risk
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Time Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Study Time Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSpentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Active Students']} />
              <Area 
                type="monotone" 
                dataKey="students" 
                stroke="#F59E0B" 
                fill="#F59E0B" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Strengths</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">High completion rate (78%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Strong student engagement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Positive review ratings (4.8/5)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Areas for Improvement</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">High drop-off in quiz sections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Assignment completion needs work</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Mobile experience optimization</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}