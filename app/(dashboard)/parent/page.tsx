'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  Award,
  Video,
  FileText,
  HelpCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Mock data
const mockParentData = {
  parent: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    children: [
      {
        id: '1',
        name: 'Emma Johnson',
        avatar: '/avatars/emma.jpg',
        grade: 'Grade 10',
        age: 15,
        overallProgress: 87,
        averageGrade: 92,
        attendanceRate: 95,
        activeCourses: 5,
        status: 'active'
      },
      {
        id: '2',
        name: 'Lucas Johnson',
        avatar: '/avatars/lucas.jpg',
        grade: 'Grade 8',
        age: 13,
        overallProgress: 78,
        averageGrade: 85,
        attendanceRate: 88,
        activeCourses: 4,
        status: 'active'
      }
    ]
  },
  stats: {
    totalChildren: 2,
    activeEnrollments: 9,
    upcomingClasses: 3,
    pendingPayments: 1,
    unreadMessages: 5
  },
  todaySchedule: [
    {
      id: '1',
      type: 'live-class',
      title: 'Advanced Mathematics',
      child: 'Emma Johnson',
      time: '10:00 AM',
      duration: '60 min',
      status: 'upcoming'
    },
    {
      id: '2',
      type: 'assignment',
      title: 'Science Lab Report',
      child: 'Lucas Johnson',
      dueTime: '2:00 PM',
      status: 'pending'
    },
    {
      id: '3',
      type: 'quiz',
      title: 'History Quiz',
      child: 'Emma Johnson',
      time: '4:00 PM',
      duration: '30 min',
      status: 'upcoming'
    }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'grade',
      child: 'Emma Johnson',
      title: 'Mathematics Assignment',
      description: 'Received grade: A (95%)',
      time: '2 hours ago',
      icon: Award,
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'attendance',
      child: 'Lucas Johnson',
      title: 'Science Live Class',
      description: 'Attended full session',
      time: '5 hours ago',
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'submission',
      child: 'Emma Johnson',
      title: 'English Essay',
      description: 'Submitted assignment',
      time: '1 day ago',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      id: '4',
      type: 'enrollment',
      child: 'Lucas Johnson',
      title: 'Advanced Programming',
      description: 'Enrolled in new course',
      time: '2 days ago',
      icon: BookOpen,
      color: 'text-indigo-600'
    }
  ],
  performanceAlerts: [
    {
      id: '1',
      type: 'low-grade',
      severity: 'warning',
      child: 'Lucas Johnson',
      title: 'Low Quiz Score',
      description: 'Mathematics Quiz: 65% - Below average',
      action: 'View Details',
      link: '/dashboard/parent/performance'
    },
    {
      id: '2',
      type: 'missing-assignment',
      severity: 'danger',
      child: 'Emma Johnson',
      title: 'Missing Assignment',
      description: 'Chemistry Lab Report - Due yesterday',
      action: 'Contact Teacher',
      link: '/dashboard/parent/messages'
    },
    {
      id: '3',
      type: 'attendance',
      severity: 'info',
      child: 'Lucas Johnson',
      title: 'Attendance Notice',
      description: 'Missed 2 live classes this week',
      action: 'View Schedule',
      link: '/dashboard/parent/attendance'
    }
  ],
  courses: [
    {
      id: '1',
      child: 'Emma Johnson',
      title: 'Advanced Mathematics',
      teacher: 'Dr. Smith',
      thumbnail: '/courses/math.jpg',
      progress: 75,
      status: 'In Progress',
      nextLesson: 'Calculus Basics'
    },
    {
      id: '2',
      child: 'Emma Johnson',
      title: 'Physics 101',
      teacher: 'Prof. Anderson',
      thumbnail: '/courses/physics.jpg',
      progress: 60,
      status: 'In Progress',
      nextLesson: 'Newton\'s Laws'
    },
    {
      id: '3',
      child: 'Lucas Johnson',
      title: 'Web Development',
      teacher: 'Mr. Johnson',
      thumbnail: '/courses/webdev.jpg',
      progress: 45,
      status: 'In Progress',
      nextLesson: 'JavaScript Basics'
    }
  ]
}

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(mockParentData.parent.children[0])
  const data = mockParentData

  // Safety check for selectedChild
  if (!selectedChild) {
    return <div>Loading...</div>
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'danger': return 'bg-red-100 text-red-700'
      case 'warning': return 'bg-yellow-100 text-yellow-700'
      case 'info': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {data.parent.name}</p>
        </div>

        {/* Child Selector */}
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select
              value={selectedChild.id}
              onValueChange={(value) => {
                const child = data.parent.children.find(c => c.id === value)
                if (child) setSelectedChild(child)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.parent.children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} - {child.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/dashboard/parent/children">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Children
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalChildren}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.activeEnrollments}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.upcomingClasses}</p>
              </div>
              <Video className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.pendingPayments}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.unreadMessages}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Child Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={selectedChild.avatar} />
              <AvatarFallback>{selectedChild.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedChild.name}</h3>
                <p className="text-gray-600">{selectedChild.grade} • {selectedChild.age} years old</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedChild.overallProgress} className="flex-1" />
                    <span className="text-sm font-semibold">{selectedChild.overallProgress}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-green-600">{selectedChild.averageGrade}%</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedChild.attendanceRate}%</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedChild.activeCourses}</p>
                </div>
              </div>
            </div>

            <Link href={`/dashboard/parent/children/${selectedChild.id}`}>
              <Button>View Full Report</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.todaySchedule.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {item.type === 'live-class' && <Video className="w-5 h-5 text-blue-600" />}
                    {item.type === 'assignment' && <FileText className="w-5 h-5 text-orange-600" />}
                    {item.type === 'quiz' && <HelpCircle className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.child}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.time || item.dueTime}
                      {item.duration && ` • ${item.duration}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/dashboard/parent/children">
              <Button variant="outline" className="w-full mt-4">
                View Full Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.child}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.performanceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-sm text-gray-900">{alert.title}</p>
                    <Badge className={`text-xs ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{alert.child}</p>
                  <p className="text-xs text-gray-700 mb-3">{alert.description}</p>
                  <Link href={alert.link}>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      {alert.action}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Progress Overview</CardTitle>
            <Link href="/dashboard/parent/performance">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.courses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900">{course.title}</h4>
                    <p className="text-xs text-gray-600">{course.teacher}</p>
                    <p className="text-xs text-gray-500">{course.child}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                  
                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-gray-600">Next: {course.nextLesson}</span>
                    <Badge variant="outline" className="text-xs">{course.status}</Badge>
                  </div>
                </div>

                <Link href={`/dashboard/parent/performance`}>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
