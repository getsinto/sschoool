'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  CheckCircle,
  UserPlus,
  Video,
  MessageSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  Megaphone,
  FileText,
  Eye,
  Activity
} from 'lucide-react'
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
import UserActivityHeatmap from '@/components/dashboard/UserActivityHeatmap'

// Mock data - in real app, this would come from API/Supabase
const statsData = {
  totalUsers: {
    total: 2847,
    students: 2156,
    teachers: 89,
    parents: 602,
    change: 12.5,
    trend: 'up' as const
  },
  totalRevenue: {
    current: 45680,
    previous: 38920,
    change: 17.4,
    trend: 'up' as const
  },
  activeCourses: {
    total: 156,
    change: 8.2,
    trend: 'up' as const
  },
  pendingApprovals: {
    total: 23,
    change: -15.3,
    trend: 'down' as const
  },
  newRegistrations: {
    total: 89,
    change: 23.1,
    trend: 'up' as const
  },
  liveClassesToday: {
    total: 34,
    change: 5.8,
    trend: 'up' as const
  },
  supportTickets: {
    total: 12,
    change: -8.7,
    trend: 'down' as const
  },
  platformUsage: {
    total: 1247,
    change: 15.2,
    trend: 'up' as const
  }
}

const revenueData = [
  { month: 'Jan', revenue: 32000 },
  { month: 'Feb', revenue: 35000 },
  { month: 'Mar', revenue: 38000 },
  { month: 'Apr', revenue: 41000 },
  { month: 'May', revenue: 39000 },
  { month: 'Jun', revenue: 43000 },
  { month: 'Jul', revenue: 45000 },
  { month: 'Aug', revenue: 47000 },
  { month: 'Sep', revenue: 44000 },
  { month: 'Oct', revenue: 48000 },
  { month: 'Nov', revenue: 46000 },
  { month: 'Dec', revenue: 45680 }
]

const userGrowthData = [
  { month: 'Jul', users: 1850 },
  { month: 'Aug', users: 2100 },
  { month: 'Sep', users: 2350 },
  { month: 'Oct', users: 2580 },
  { month: 'Nov', users: 2720 },
  { month: 'Dec', users: 2847 }
]

const courseEnrollmentData = [
  { course: 'Math Grade 10', enrollments: 245 },
  { course: 'English Lit', enrollments: 198 },
  { course: 'Physics 12', enrollments: 167 },
  { course: 'Chemistry', enrollments: 156 },
  { course: 'Biology', enrollments: 143 },
  { course: 'Spoken English', enrollments: 234 },
  { course: 'SAT Prep', enrollments: 189 },
  { course: 'Business English', enrollments: 123 },
  { course: 'IELTS Prep', enrollments: 145 },
  { course: 'French Basic', enrollments: 98 }
]

const recentActivities = [
  {
    id: 1,
    type: 'registration',
    message: 'New student Sarah Johnson registered',
    time: '2 minutes ago',
    icon: UserPlus,
    color: 'text-green-600'
  },
  {
    id: 2,
    type: 'enrollment',
    message: 'Ahmed Ali enrolled in Mathematics Grade 10',
    time: '5 minutes ago',
    icon: BookOpen,
    color: 'text-blue-600'
  },
  {
    id: 3,
    type: 'payment',
    message: 'Payment of $299 received from Maria Rodriguez',
    time: '8 minutes ago',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    id: 4,
    type: 'support',
    message: 'New support ticket: Login issues',
    time: '12 minutes ago',
    icon: MessageSquare,
    color: 'text-orange-600'
  },
  {
    id: 5,
    type: 'class',
    message: 'Live class started: English Literature Grade 11',
    time: '15 minutes ago',
    icon: Video,
    color: 'text-purple-600'
  }
]

const StatCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  subtitle 
}: {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
  icon: any
  subtitle?: string
}) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center mt-4">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </CardContent>
  </Card>
)

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <Activity className="w-4 h-4" />
            <span className="font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={statsData.totalUsers.total.toLocaleString()}
          change={statsData.totalUsers.change}
          trend={statsData.totalUsers.trend}
          icon={Users}
          subtitle={`${statsData.totalUsers.students} students, ${statsData.totalUsers.teachers} teachers`}
        />
        <StatCard
          title="Total Revenue"
          value={`$${statsData.totalRevenue.current.toLocaleString()}`}
          change={statsData.totalRevenue.change}
          trend={statsData.totalRevenue.trend}
          icon={DollarSign}
          subtitle="This month"
        />
        <StatCard
          title="Active Courses"
          value={statsData.activeCourses.total}
          change={statsData.activeCourses.change}
          trend={statsData.activeCourses.trend}
          icon={BookOpen}
        />
        <StatCard
          title="Pending Approvals"
          value={statsData.pendingApprovals.total}
          change={statsData.pendingApprovals.change}
          trend={statsData.pendingApprovals.trend}
          icon={CheckCircle}
        />
      </div>

      {/* Statistics Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="New Registrations"
          value={statsData.newRegistrations.total}
          change={statsData.newRegistrations.change}
          trend={statsData.newRegistrations.trend}
          icon={UserPlus}
          subtitle="This week"
        />
        <StatCard
          title="Live Classes Today"
          value={statsData.liveClassesToday.total}
          change={statsData.liveClassesToday.change}
          trend={statsData.liveClassesToday.trend}
          icon={Video}
        />
        <StatCard
          title="Support Tickets"
          value={statsData.supportTickets.total}
          change={statsData.supportTickets.change}
          trend={statsData.supportTickets.trend}
          icon={MessageSquare}
          subtitle="Open tickets"
        />
        <StatCard
          title="Platform Usage"
          value={`${statsData.platformUsage.total}h`}
          change={statsData.platformUsage.change}
          trend={statsData.platformUsage.trend}
          icon={Clock}
          subtitle="This week"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Revenue Trend</span>
              <Badge variant="outline">Last 12 months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>User Growth</span>
              <Badge variant="outline">Last 6 months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Users']} />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Course Enrollments and Activity Heatmap */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Course Enrollments</span>
              <Badge variant="outline">This month</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={courseEnrollmentData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="course" type="category" width={120} />
                <Tooltip formatter={(value) => [value, 'Enrollments']} />
                <Bar dataKey="enrollments" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Activity Heatmap */}
        <UserActivityHeatmap />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Recent Activity</span>
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Live Class
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Megaphone className="w-4 h-4 mr-2" />
              Send Announcement
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Pending Approvals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}