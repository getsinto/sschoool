'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Clock,
  Download,
  UserCheck,
  UserX
} from 'lucide-react'

export default function UserActivityPage() {
  const [timeRange, setTimeRange] = useState('30days')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserActivity()
  }, [timeRange])

  const fetchUserActivity = async () => {
    try {
      const response = await fetch(`/api/admin/reports/users?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        // Process data
      }
    } catch (error) {
      console.error('Error fetching user activity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = {
    totalUsers: 1250,
    activeUsers: 892,
    newUsers: 145,
    churnRate: 8.5,
    avgSessionDuration: 24,
    retentionRate: 78.5
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Activity Reports</h1>
          <p className="text-gray-600">Monitor user engagement and behavior</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">+{stats.newUsers} new</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-xs text-blue-600 mt-1">{((stats.activeUsers/stats.totalUsers)*100).toFixed(1)}% active</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold">{stats.retentionRate}%</p>
                <p className="text-xs text-purple-600 mt-1">Churn: {stats.churnRate}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chart visualization with Recharts</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Session Duration</span>
                <span className="font-medium">{stats.avgSessionDuration} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Active Users</span>
                <span className="font-medium">456</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Weekly Active Users</span>
                <span className="font-medium">892</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Active Users</span>
                <span className="font-medium">1,120</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Feature usage heatmap</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
