'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  MessageSquare, 
  Eye, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const mockStudents = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: '/avatars/sarah.jpg',
    enrolledCourses: ['Advanced Mathematics', 'Physics Fundamentals'],
    totalProgress: 85,
    lastActive: '2 hours ago',
    status: 'active',
    joinDate: '2024-01-10',
    completedAssignments: 12,
    totalAssignments: 15,
    averageScore: 92,
    attendanceRate: 95,
    riskLevel: 'low'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    avatar: '/avatars/michael.jpg',
    enrolledCourses: ['Advanced Mathematics', 'Chemistry Basics'],
    totalProgress: 72,
    lastActive: '1 day ago',
    status: 'active',
    joinDate: '2024-01-08',
    completedAssignments: 10,
    totalAssignments: 14,
    averageScore: 78,
    attendanceRate: 88,
    riskLevel: 'low'
  },
  {
    id: 3,
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    avatar: '/avatars/emma.jpg',
    enrolledCourses: ['English Literature', 'World History'],
    totalProgress: 45,
    lastActive: '3 days ago',
    status: 'at-risk',
    joinDate: '2024-01-05',
    completedAssignments: 6,
    totalAssignments: 13,
    averageScore: 65,
    attendanceRate: 70,
    riskLevel: 'medium'
  },
  {
    id: 4,
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    avatar: '/avatars/alex.jpg',
    enrolledCourses: ['Advanced Mathematics'],
    totalProgress: 25,
    lastActive: '1 week ago',
    status: 'inactive',
    joinDate: '2024-01-12',
    completedAssignments: 3,
    totalAssignments: 12,
    averageScore: 45,
    attendanceRate: 40,
    riskLevel: 'high'
  },
  {
    id: 5,
    name: 'Jessica Lee',
    email: 'jessica.lee@email.com',
    avatar: '/avatars/jessica.jpg',
    enrolledCourses: ['Physics Fundamentals', 'Chemistry Basics'],
    totalProgress: 90,
    lastActive: '30 minutes ago',
    status: 'active',
    joinDate: '2024-01-03',
    completedAssignments: 18,
    totalAssignments: 20,
    averageScore: 96,
    attendanceRate: 98,
    riskLevel: 'low'
  },
  {
    id: 6,
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    avatar: '/avatars/david.jpg',
    enrolledCourses: ['English Literature'],
    totalProgress: 35,
    lastActive: '5 days ago',
    status: 'at-risk',
    joinDate: '2024-01-15',
    completedAssignments: 4,
    totalAssignments: 11,
    averageScore: 58,
    attendanceRate: 60,
    riskLevel: 'high'
  }
]

export default function TeacherStudentsPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === 'all' || student.enrolledCourses.includes(selectedCourse)
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'active' && student.status === 'active') ||
                      (selectedTab === 'at-risk' && student.riskLevel !== 'low') ||
                      (selectedTab === 'inactive' && student.status === 'inactive')
    
    return matchesSearch && matchesCourse && matchesStatus && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'at-risk': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return AlertTriangle
      case 'medium': return Clock
      case 'low': return CheckCircle
      default: return CheckCircle
    }
  }

  const activeCount = mockStudents.filter(s => s.status === 'active').length
  const atRiskCount = mockStudents.filter(s => s.riskLevel !== 'low').length
  const inactiveCount = mockStudents.filter(s => s.status === 'inactive').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600 mt-1">Monitor and support your students' progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowBulkEmailModal(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Bulk Email
          </Button>
          <Button size="sm" onClick={() => setShowMessageModal(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudents.length}</div>
            <p className="text-xs text-green-600 mt-1">+3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-gray-600 mt-1">Currently engaged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{atRiskCount}</div>
            <p className="text-xs text-yellow-600 mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-green-600 mt-1">+5% this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="Advanced Mathematics">Advanced Mathematics</SelectItem>
              <SelectItem value="Physics Fundamentals">Physics Fundamentals</SelectItem>
              <SelectItem value="English Literature">English Literature</SelectItem>
              <SelectItem value="Chemistry Basics">Chemistry Basics</SelectItem>
              <SelectItem value="World History">World History</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            All ({mockStudents.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="at-risk" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            At Risk ({atRiskCount})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Inactive ({inactiveCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStudents.map((student, index) => {
              const RiskIcon = getRiskIcon(student.riskLevel)
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{student.name}</h3>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(student.status)}>
                                {student.status}
                              </Badge>
                              <div className={`flex items-center gap-1 ${getRiskLevelColor(student.riskLevel)}`}>
                                <RiskIcon className="w-3 h-3" />
                                <span className="text-xs font-medium">{student.riskLevel} risk</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                            <span className="text-sm font-semibold text-gray-900">{student.totalProgress}%</span>
                          </div>
                          <Progress value={student.totalProgress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Assignments</p>
                            <p className="font-medium">{student.completedAssignments}/{student.totalAssignments}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Average Score</p>
                            <p className="font-medium">{student.averageScore}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Attendance</p>
                            <p className="font-medium">{student.attendanceRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Active</p>
                            <p className="font-medium">{student.lastActive}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Enrolled Courses</p>
                          <div className="flex flex-wrap gap-1">
                            {student.enrolledCourses.map((course, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600 mb-6">No students match your current filters.</p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('')
            setSelectedCourse('all')
            setSelectedStatus('all')
            setSelectedTab('all')
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}