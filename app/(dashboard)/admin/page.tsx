'use client'

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
  Activity,
  Download,
  RefreshCw
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
  ResponsiveContainer
} from 'recharts'
import UserActivityHeatmap from '@/components/dashboard/UserActivityHeatmap'
import EmptyState from '@/components/dashboard/EmptyState'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { exportToCSV, exportToJSON, exportToPDF } from '@/lib/dashboard/export'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const { data, loading, error, refresh } = useAdminDashboard()

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    const timestamp = new Date().toISOString().split('T')[0]
    
    switch (format) {
      case 'csv':
        exportToCSV(data, `dashboard-${timestamp}.csv`)
        break
      case 'json':
        exportToJSON(data, `dashboard-${timestamp}.json`)
        break
      case 'pdf':
        exportToPDF(data)
        break
    }
  }

  if (loading) {
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

  if (error) {
    return (
      <div className="space-y-6">
        <EmptyState
          type="general"
          title="Error Loading Dashboard"
          description={error}
          actionLabel="Retry"
          onAction={refresh}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <EmptyState
          type="general"
          title="No Data Available"
          description="Dashboard data is not available at the moment."
          actionLabel="Refresh"
          onAction={refresh}
        />
      </div>
    )
  }

  const hasUsers = data.stats && data.stats.totalUsers.total > 0
  const hasRevenue = data.revenueData && data.revenueData.length > 0
  const hasActivities = data.recentActivities && data.recentActivities.length > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Live Indicator */}
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Activity className="w-4 h-4" />
            <span className="font-medium">Live</span>
          </div>

          {/* Refresh Button */}
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Statistics Cards Row 1 */}
      {hasUsers ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={data.stats?.totalUsers.total.toLocaleString() || '0'}
            change={data.stats?.totalUsers.change}
            trend={data.stats?.totalUsers.trend}
            icon={Users}
            subtitle={`${data.stats?.totalUsers.students || 0} students, ${data.stats?.totalUsers.teachers || 0} teachers`}
          />
          <StatCard
            title="Total Revenue"
            value={`$${data.stats?.totalRevenue.current.toLocaleString() || '0'}`}
            change={data.stats?.totalRevenue.change}
            trend={data.stats?.totalRevenue.trend}
            icon={DollarSign}
            subtitle="This month"
          />
          <StatCard
            title="Active Courses"
            value={data.stats?.activeCourses.total || 0}
            change={data.stats?.activeCourses.change}
            trend={data.stats?.activeCourses.trend}
            icon={BookOpen}
          />
          <StatCard
            title="Pending Approvals"
            value={data.stats?.pendingApprovals.total || 0}
            change={data.stats?.pendingApprovals.change}
            trend={data.stats?.pendingApprovals.trend}
            icon={CheckCircle}
          />
        </div>
      ) : (
        <EmptyState
          type="users"
          onAction={() => window.location.href = '/admin/users'}
        />
      )}

      {/* Statistics Cards Row 2 */}
      {hasUsers && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="New Registrations"
            value={data.stats?.newRegistrations.total || 0}
            change={data.stats?.newRegistrations.change}
            trend={data.stats?.newRegistrations.trend}
            icon={UserPlus}
            subtitle="This week"
          />
          <StatCard
            title="Live Classes Today"
            value={data.stats?.liveClassesToday.total || 0}
            change={data.stats?.liveClassesToday.change}
            trend={data.stats?.liveClassesToday.trend}
            icon={Video}
          />
          <StatCard
            title="Support Tickets"
            value={data.stats?.supportTickets.total || 0}
            change={data.stats?.supportTickets.change}
            trend={data.stats?.supportTickets.trend}
            icon={MessageSquare}
            subtitle="Open tickets"
          />
          <StatCard
            title="Platform Usage"
            value={`${data.stats?.platformUsage.total || 0}h`}
            change={data.stats?.platformUsage.change}
            trend={data.stats?.platformUsage.trend}
            icon={Clock}
            subtitle="This week"
          />
        </div>
      )}

      {/* Charts Section */}
      {hasRevenue ? (
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
              {data.revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.revenueData}>
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
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <EmptyState type="revenue" />
                </div>
              )}
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
              {data.userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.userGrowthData}>
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
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <EmptyState type="users" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState type="revenue" />
      )}

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
            {data.courseEnrollmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.courseEnrollmentData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="course" type="category" width={120} />
                  <Tooltip formatter={(value) => [value, 'Enrollments']} />
                  <Bar dataKey="enrollments" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <EmptyState type="courses" />
              </div>
            )}
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
            {hasActivities ? (
              <div className="space-y-4">
                {data.recentActivities.map((activity) => {
                  const iconMap: Record<string, any> = {
                    registration: UserPlus,
                    enrollment: BookOpen,
                    payment: DollarSign,
                    support: MessageSquare,
                    class: Video
                  }
                  const ActivityIcon = iconMap[activity.type] || Activity

                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}>
                        <ActivityIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState type="activities" onAction={refresh} />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/courses'}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/live-classes/schedule'}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Live Class
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/communication/announcements/create'}>
              <Megaphone className="w-4 h-4 mr-2" />
              Send Announcement
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleExport('pdf')}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/registrations'}>
              <Eye className="w-4 h-4 mr-2" />
              View Pending Approvals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
