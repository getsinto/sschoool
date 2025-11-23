'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ClipboardCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  MessageSquare,
  Filter,
  Search,
  Calendar,
  FileText,
  Star,
  User,
  BookOpen,
  Edit,
  Send
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const mockGradingTasks = [
  {
    id: 1,
    type: 'quiz',
    title: 'Algebra Fundamentals Quiz',
    course: 'Advanced Mathematics',
    student: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      email: 'sarah.johnson@email.com'
    },
    submittedAt: '2024-01-15T10:30:00',
    dueDate: '2024-01-15T23:59:00',
    priority: 'high',
    status: 'pending',
    score: null,
    maxScore: 100,
    timeSpent: '25 minutes'
  },
  {
    id: 2,
    type: 'assignment',
    title: 'Physics Lab Report',
    course: 'Physics Fundamentals',
    student: {
      name: 'Michael Chen',
      avatar: '/avatars/michael.jpg',
      email: 'michael.chen@email.com'
    },
    submittedAt: '2024-01-14T16:45:00',
    dueDate: '2024-01-16T23:59:00',
    priority: 'medium',
    status: 'pending',
    score: null,
    maxScore: 50,
    timeSpent: '2 hours'
  },
  {
    id: 3,
    type: 'essay',
    title: 'Shakespeare Analysis Essay',
    course: 'English Literature',
    student: {
      name: 'Emma Davis',
      avatar: '/avatars/emma.jpg',
      email: 'emma.davis@email.com'
    },
    submittedAt: '2024-01-13T14:20:00',
    dueDate: '2024-01-20T23:59:00',
    priority: 'low',
    status: 'pending',
    score: null,
    maxScore: 100,
    timeSpent: '3 hours'
  },
  {
    id: 4,
    type: 'quiz',
    title: 'Chemical Reactions Quiz',
    course: 'Chemistry Basics',
    student: {
      name: 'Alex Thompson',
      avatar: '/avatars/alex.jpg',
      email: 'alex.thompson@email.com'
    },
    submittedAt: '2024-01-12T09:15:00',
    dueDate: '2024-01-12T23:59:00',
    priority: 'high',
    status: 'graded',
    score: 85,
    maxScore: 100,
    timeSpent: '30 minutes'
  },
  {
    id: 5,
    type: 'assignment',
    title: 'History Timeline Project',
    course: 'World History',
    student: {
      name: 'Jessica Lee',
      avatar: '/avatars/jessica.jpg',
      email: 'jessica.lee@email.com'
    },
    submittedAt: '2024-01-11T11:30:00',
    dueDate: '2024-01-15T23:59:00',
    priority: 'medium',
    status: 'graded',
    score: 92,
    maxScore: 100,
    timeSpent: '4 hours'
  }
]

export default function TeacherGradingPage() {
  const [selectedTab, setSelectedTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showBulkFeedbackModal, setShowBulkFeedbackModal] = useState(false)

  const filteredTasks = mockGradingTasks.filter(task => {
    const matchesTab = selectedTab === 'all' || task.status === selectedTab
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === 'all' || task.course === selectedCourse
    const matchesType = selectedType === 'all' || task.type === selectedType
    
    return matchesTab && matchesSearch && matchesCourse && matchesType
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return ClipboardCheck
      case 'assignment': return FileText
      case 'essay': return Edit
      default: return FileText
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeUntilDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString)
    const now = new Date()
    const diffHours = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 0) return 'Overdue'
    if (diffHours < 24) return `${diffHours}h remaining`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d remaining`
  }

  const pendingCount = mockGradingTasks.filter(task => task.status === 'pending').length
  const gradedCount = mockGradingTasks.filter(task => task.status === 'graded').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grading Center</h1>
          <p className="text-gray-600 mt-1">Review and grade student submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowScheduleModal(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button size="sm" onClick={() => setShowBulkFeedbackModal(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Bulk Feedback
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Grading</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Graded Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-gray-600 mt-1">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">87%</div>
            <p className="text-xs text-green-600 mt-1">+3% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Urgent Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-red-600 mt-1">Due within 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by student, assignment, or course..."
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
            </SelectContent>
          </Select>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="quiz">Quizzes</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="essay">Essays</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grading Tasks */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="graded" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Graded ({gradedCount})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            All ({mockGradingTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredTasks.map((task, index) => {
            const TypeIcon = getTypeIcon(task.type)
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <TypeIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
                              <p className="text-sm text-gray-600">{task.course}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority} priority
                              </Badge>
                              <Badge variant={task.status === 'graded' ? 'default' : 'secondary'}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={task.student.avatar} alt={task.student.name} />
                                <AvatarFallback>{task.student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{task.student.name}</p>
                                <p className="text-xs text-gray-500">{task.student.email}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Submitted</p>
                              <p className="font-medium">{formatDate(task.submittedAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Due Date</p>
                              <p className="font-medium">{getTimeUntilDue(task.dueDate)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Time Spent</p>
                              <p className="font-medium">{task.timeSpent}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Score</p>
                              <p className="font-medium">
                                {task.score !== null ? `${task.score}/${task.maxScore}` : `—/${task.maxScore}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          {task.status === 'pending' ? 'Grade' : 'Review'}
                        </Button>
                        <Button size="sm" variant="outline">
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
        </TabsContent>
      </Tabs>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No grading tasks found</h3>
          <p className="text-gray-600 mb-6">All caught up! No submissions match your current filters.</p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('')
            setSelectedCourse('all')
            setSelectedType('all')
            setSelectedTab('all')
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}