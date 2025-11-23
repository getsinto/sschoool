'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard'
import { useRealtimeTeacherData } from '@/hooks/useRealtimeTeacherData'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  Star, 
  Clock, 
  DollarSign, 
  UserCheck,
  TrendingUp,
  BarChart3,
  Activity,
  Gauge,
  Plus,
  MessageSquare,
  AlertTriangle,
  Play,
  Eye,
  GraduationCap,
  Award,
  FileText,
  Bell,
  Video,
  Edit,
  Send
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

// Fallback mock data for when loading or no data
const mockStats = {
  totalCourses: 12,
  totalStudents: 245,
  upcomingClasses: 3,
  pendingGrading: 18,
  averageRating: 4.8,
  teachingHours: 156,
  monthlyEarnings: 2850,
  activeEnrollments: 89
}

const mockUpcomingClasses = [
  {
    id: 1,
    title: 'Advanced Mathematics',
    course: 'Grade 10 Mathematics',
    dateTime: '2024-01-15T10:00:00',
    duration: 60,
    studentsCount: 25,
    canJoin: true,
    meetingLink: 'https://zoom.us/j/123456789'
  },
  {
    id: 2,
    title: 'Physics Lab Session',
    course: 'Grade 9 Physics',
    dateTime: '2024-01-15T14:30:00',
    duration: 90,
    studentsCount: 18,
    canJoin: false,
    meetingLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: 3,
    title: 'English Literature Discussion',
    course: 'Grade 8 English',
    dateTime: '2024-01-15T16:00:00',
    duration: 45,
    studentsCount: 22,
    canJoin: false,
    meetingLink: 'https://zoom.us/j/987654321'
  },
  {
    id: 4,
    title: 'Chemistry Basics',
    course: 'Grade 9 Chemistry',
    dateTime: '2024-01-16T09:00:00',
    duration: 75,
    studentsCount: 20,
    canJoin: false,
    meetingLink: 'https://meet.google.com/xyz-uvwx-rst'
  },
  {
    id: 5,
    title: 'History Review',
    course: 'Grade 8 History',
    dateTime: '2024-01-16T11:00:00',
    duration: 50,
    studentsCount: 28,
    canJoin: false,
    meetingLink: 'https://zoom.us/j/456789123'
  }
]

const mockRecentActivity = [
  {
    id: 1,
    type: 'enrollment',
    message: 'Sarah Johnson enrolled in Advanced Mathematics',
    time: '2 minutes ago',
    icon: UserCheck,
    color: 'text-green-600'
  },
  {
    id: 2,
    type: 'submission',
    message: 'New quiz submission from Michael Chen',
    time: '15 minutes ago',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    id: 3,
    type: 'message',
    message: 'Emma Davis sent you a message',
    time: '1 hour ago',
    icon: MessageSquare,
    color: 'text-purple-600'
  },
  {
    id: 4,
    type: 'review',
    message: 'New 5-star review for Physics Fundamentals',
    time: '2 hours ago',
    icon: Star,
    color: 'text-yellow-600'
  },
  {
    id: 5,
    type: 'assignment',
    message: 'Assignment submitted by Alex Thompson',
    time: '3 hours ago',
    icon: ClipboardCheck,
    color: 'text-indigo-600'
  },
  {
    id: 6,
    type: 'enrollment',
    message: 'David Wilson enrolled in English Literature',
    time: '4 hours ago',
    icon: UserCheck,
    color: 'text-green-600'
  }
]

const mockStudentsAtRisk = [
  {
    id: 1,
    name: 'Alex Thompson',
    avatar: '/avatars/alex.jpg',
    course: 'Grade 9 Mathematics',
    issue: 'Low completion rate (35%)',
    lastActive: '5 days ago',
    riskLevel: 'high',
    completionRate: 35
  },
  {
    id: 2,
    name: 'Jessica Lee',
    avatar: '/avatars/jessica.jpg',
    course: 'Grade 10 Physics',
    issue: 'Poor quiz scores (avg 45%)',
    lastActive: '2 days ago',
    riskLevel: 'medium',
    completionRate: 60
  },
  {
    id: 3,
    name: 'David Wilson',
    avatar: '/avatars/david.jpg',
    course: 'Grade 8 English',
    issue: 'Inactive for 8 days',
    lastActive: '8 days ago',
    riskLevel: 'high',
    completionRate: 25
  }
]

const mockCoursePerformance = [
  {
    id: 1,
    name: 'Advanced Mathematics',
    enrollments: 45,
    completionRate: 78,
    averageRating: 4.9,
    lastUpdated: '2 days ago',
    status: 'active',
    revenue: 1250
  },
  {
    id: 2,
    name: 'Physics Fundamentals',
    enrollments: 38,
    completionRate: 82,
    averageRating: 4.7,
    lastUpdated: '1 week ago',
    status: 'active',
    revenue: 980
  },
  {
    id: 3,
    name: 'English Literature',
    enrollments: 52,
    completionRate: 65,
    averageRating: 4.6,
    lastUpdated: '3 days ago',
    status: 'active',
    revenue: 1560
  },
  {
    id: 4,
    name: 'Chemistry Basics',
    enrollments: 30,
    completionRate: 70,
    averageRating: 4.5,
    lastUpdated: '5 days ago',
    status: 'active',
    revenue: 750
  }
]

export default function TeacherDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week')
  
  // Using real Supabase data
  const {
    loading,
    error,
    stats,
    upcomingClasses: dashboardUpcomingClasses,
    recentActivity: dashboardRecentActivity,
    studentsAtRisk: dashboardStudentsAtRisk,
    coursePerformance: dashboardCoursePerformance,
    refetch
  } = useTeacherDashboard()

  // Real-time data
  const {
    newEnrollments,
    newSubmissions,
    newMessages,
    lastUpdate,
    resetCounters
  } = useRealtimeTeacherData()
  
  // Use real data if available, otherwise fallback to mock data
  const currentStats = stats || mockStats
  const currentUpcomingClasses = dashboardUpcomingClasses.length > 0 ? dashboardUpcomingClasses : mockUpcomingClasses
  const currentRecentActivity = dashboardRecentActivity.length > 0 ? dashboardRecentActivity : mockRecentActivity
  const currentStudentsAtRisk = dashboardStudentsAtRisk.length > 0 ? dashboardStudentsAtRisk : mockStudentsAtRisk
  const currentCoursePerformance = dashboardCoursePerformance.length > 0 ? dashboardCoursePerformance : mockCoursePerformance

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    const now = new Date()
    const diffMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60))
    
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      canJoin: diffMinutes <= 15 && diffMinutes >= -5 // Can join 15 minutes before to 5 minutes after
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your teaching overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Statistics Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses Created</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{currentStats.totalCourses}</div>
              <p className="text-xs text-green-600 mt-1">+2 this month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students Taught</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{currentStats.totalStudents}</div>
              <p className="text-xs text-green-600 mt-1">+12 this week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Classes (Today)</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{currentStats.upcomingClasses}</div>
              <p className="text-xs text-blue-600 mt-1">Next in 2 hours</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Grading Tasks</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{currentStats.pendingGrading}</div>
              <p className="text-xs text-orange-600 mt-1">5 urgent</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Statistics Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Course Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{currentStats.averageRating}</div>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.floor(currentStats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Teaching Hours</CardTitle>
              <Clock className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{currentStats.teachingHours}h</div>
              <p className="text-xs text-green-600 mt-1">+8h this week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${currentStats.monthlyEarnings}</div>
              <p className="text-xs text-green-600 mt-1">+15% from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Enrollments</CardTitle>
              <UserCheck className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{currentStats.activeEnrollments}</div>
              <p className="text-xs text-blue-600 mt-1">85% completion rate</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Student Enrollment Trend
              </CardTitle>
              <CardDescription>Last 6 months enrollment data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Chart Component Placeholder</p>
                  <p className="text-xs text-gray-500">Integration with Chart.js or Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Course Performance Comparison
              </CardTitle>
              <CardDescription>Comparison of course metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Bar Chart Placeholder</p>
                  <p className="text-xs text-gray-500">Course completion & rating comparison</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Teaching Hours Per Week
              </CardTitle>
              <CardDescription>Weekly teaching hours breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Area Chart Placeholder</p>
                  <p className="text-xs text-gray-500">Hours per week trend</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-orange-600" />
                Student Engagement Metrics
              </CardTitle>
              <CardDescription>Overall engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
                <div className="text-center">
                  <Gauge className="h-12 w-12 text-orange-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Gauge Chart Placeholder</p>
                  <p className="text-xs text-gray-500">Engagement score: 85%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Classes
              </CardTitle>
              <CardDescription>Next 5 scheduled classes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading classes...</p>
                </div>
              )}
              {error && (
                <div className="text-center py-4">
                  <p className="text-sm text-red-600">{error}</p>
                  <Button size="sm" variant="outline" onClick={refetch} className="mt-2">
                    Retry
                  </Button>
                </div>
              )}
              {!loading && !error && currentUpcomingClasses.map((class_) => {
                const { date, time, canJoin } = formatDateTime(class_.dateTime)
                return (
                  <div key={class_.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{class_.title}</h4>
                      <p className="text-sm text-gray-600">{class_.course}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">{date} at {time}</span>
                        <span className="text-xs text-blue-600">{class_.studentsCount} students</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {canJoin ? (
                        <Button size="sm" className="text-xs">
                          <Play className="w-3 h-3 mr-1" />
                          Join Class
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
              <Button variant="outline" className="w-full mt-4">
                <Calendar className="w-4 h-4 mr-2" />
                View All Classes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading activity...</p>
                </div>
              )}
              {!loading && currentRecentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-full bg-white ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
              <Button variant="outline" className="w-full mt-4">
                <Bell className="w-4 h-4 mr-2" />
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/teacher/courses/create">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create New Course
                </Button>
              </Link>
              <Link href="/teacher/live-classes/create">
                <Button className="w-full justify-start" variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  Schedule Live Class
                </Button>
              </Link>
              <Link href="/teacher/messages/compose">
                <Button className="w-full justify-start" variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message to Students
                </Button>
              </Link>
              <Link href="/teacher/gradebook">
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  View Pending Grading
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                <Award className="w-4 h-4 mr-2" />
                Generate Certificates
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Students at Risk */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Students at Risk
            </CardTitle>
            <CardDescription>Students who may need additional support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading && (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading students at risk...</p>
                </div>
              )}
              {!loading && currentStudentsAtRisk.map((student) => (
                <div key={student.id} className={`p-4 rounded-lg border-2 ${getRiskLevelColor(student.riskLevel)}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.course}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{student.issue}</p>
                    <p className="text-xs text-gray-500">Last active: {student.lastActive}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{student.completionRate}%</span>
                      </div>
                      <Progress value={student.completionRate} className="h-2" />
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Send Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              Course Performance Summary
            </CardTitle>
            <CardDescription>Overview of all your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Enrollments</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Completion Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Updated</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Loading course performance...</p>
                      </td>
                    </tr>
                  )}
                  {!loading && currentCoursePerformance.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">{course.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{course.enrollments}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={course.completionRate} className="w-16 h-2" />
                          <span className="text-sm text-gray-600">{course.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{course.averageRating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-green-600 font-medium">${course.revenue}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{course.lastUpdated}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}