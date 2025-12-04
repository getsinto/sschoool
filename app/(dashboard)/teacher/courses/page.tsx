'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Grid3x3, 
  List, 
  Search,
  Eye,
  Edit,
  BarChart3,
  Star,
  Users,
  BookOpen,
  Award,
  MessageSquare,
  Crown,
  AlertCircle,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface CourseAssignment {
  can_manage_content: boolean
  can_grade: boolean
  can_communicate: boolean
  is_primary_teacher: boolean
  assigned_at: string
}

interface AssignedCourse {
  id: string
  title: string
  description: string
  thumbnail: string
  category: string
  grade: string
  subject: string
  enrollments: number
  rating: number
  status: 'draft' | 'published' | 'archived'
  lastUpdated: string
  assignment: CourseAssignment
}

interface CreatedCourse {
  id: string
  title: string
  description: string
  thumbnail: string
  category: string
  grade: string
  subject: string
  enrollments: number
  rating: number
  revenue: number
  status: 'draft' | 'published' | 'archived'
  lastUpdated: string
  completionRate: number
}

// Mock data - will be replaced with API calls
const mockAssignedCourses: AssignedCourse[] = [
  {
    id: '1',
    title: 'Advanced Mathematics',
    description: 'Comprehensive mathematics course for advanced students',
    thumbnail: '/course-thumbnails/math.jpg',
    category: 'Mathematics',
    grade: 'Grade 10',
    subject: 'Algebra',
    enrollments: 245,
    rating: 4.8,
    status: 'published',
    lastUpdated: '2024-01-10',
    assignment: {
      can_manage_content: true,
      can_grade: true,
      can_communicate: true,
      is_primary_teacher: true,
      assigned_at: '2024-01-01'
    }
  },
  {
    id: '2',
    title: 'Physics Fundamentals',
    description: 'Introduction to physics concepts',
    thumbnail: '/course-thumbnails/physics.jpg',
    category: 'Science',
    grade: 'Grade 9',
    subject: 'Physics',
    enrollments: 189,
    rating: 4.6,
    status: 'published',
    lastUpdated: '2024-01-08',
    assignment: {
      can_manage_content: true,
      can_grade: false,
      can_communicate: true,
      is_primary_teacher: false,
      assigned_at: '2024-01-05'
    }
  }
]

const mockCreatedCourses: CreatedCourse[] = [
  {
    id: '3',
    title: 'English Literature',
    description: 'Explore classic and modern literature',
    thumbnail: '/course-thumbnails/english.jpg',
    category: 'Language',
    grade: 'Grade 8',
    subject: 'English',
    enrollments: 312,
    rating: 4.9,
    revenue: 15600,
    status: 'published',
    lastUpdated: '2024-01-12',
    completionRate: 78
  }
]

export default function TeacherCoursesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([])
  const [createdCourses, setCreatedCourses] = useState<CreatedCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('assigned')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual API calls
      // const assignedResponse = await fetch('/api/teacher/courses/assigned')
      // const createdResponse = await fetch('/api/teacher/courses')
      
      // Mock data for now
      setTimeout(() => {
        setAssignedCourses(mockAssignedCourses)
        setCreatedCourses(mockCreatedCourses)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setIsLoading(false)
    }
  }

  const filteredAssignedCourses = assignedCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.grade.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredCreatedCourses = createdCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.grade.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-orange-100 text-orange-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    return config[status as keyof typeof config] || config.draft
  }

  const AssignedCourseCard = ({ course }: { course: AssignedCourse }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                {course.assignment.is_primary_teacher && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">{course.grade}</Badge>
                <Badge variant="outline">{course.subject}</Badge>
                <Badge className={getStatusBadge(course.status)}>
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </Badge>
                {course.assignment.is_primary_teacher ? (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Crown className="w-3 h-3 mr-1" />
                    Primary Teacher
                  </Badge>
                ) : (
                  <Badge className="bg-purple-100 text-purple-800">
                    Content Manager
                  </Badge>
                )}
              </div>
              
              {/* Permission Indicators */}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.assignment.can_manage_content && (
                  <Badge className="bg-green-100 text-green-800">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Content
                  </Badge>
                )}
                {course.assignment.can_grade && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Award className="w-3 h-3 mr-1" />
                    Grading
                  </Badge>
                )}
                {course.assignment.can_communicate && (
                  <Badge className="bg-orange-100 text-orange-800">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Communication
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollments} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{course.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {course.assignment.can_manage_content && (
              <Link href={`/teacher/courses/${course.id}/content`} className="flex-1">
                <Button className="w-full" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Content
                </Button>
              </Link>
            )}
            <Link href={`/teacher/courses/${course.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </Link>
            <Link href={`/teacher/courses/${course.id}/analytics`}>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const CreatedCourseCard = ({ course }: { course: CreatedCourse }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                <Crown className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{course.grade}</Badge>
                <Badge variant="outline">{course.subject}</Badge>
                <Badge className={getStatusBadge(course.status)}>
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollments} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{course.rating}</span>
                </div>
                <div className="text-green-600 font-medium">
                  ${course.revenue.toLocaleString()}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Completion Rate: {course.completionRate}%
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/teacher/courses/${course.id}/edit`} className="flex-1">
              <Button className="w-full" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Course
              </Button>
            </Link>
            <Link href={`/teacher/courses/${course.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </Link>
            <Link href={`/teacher/courses/${course.id}/analytics`}>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">
            Manage your assigned and created courses
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Courses</p>
                <p className="text-3xl font-bold text-blue-600">{assignedCourses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Created Courses</p>
                <p className="text-3xl font-bold text-green-600">{createdCourses.length}</p>
              </div>
              <Crown className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-purple-600">
                  {assignedCourses.reduce((sum, c) => sum + c.enrollments, 0) +
                   createdCourses.reduce((sum, c) => sum + c.enrollments, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs for Assigned vs Created Courses */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned">
            Assigned Courses ({assignedCourses.length})
          </TabsTrigger>
          <TabsTrigger value="created">
            Created Courses ({createdCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4">
          {filteredAssignedCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Assigned Courses
                </h3>
                <p className="text-gray-600 mb-4">
                  You haven't been assigned to any courses yet.
                </p>
                <p className="text-sm text-gray-500">
                  Please contact an administrator to request course assignments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredAssignedCourses.map((course) => (
                <AssignedCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="created" className="space-y-4">
          {filteredCreatedCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Created Courses
                </h3>
                <p className="text-gray-600">
                  You haven't created any courses yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredCreatedCourses.map((course) => (
                <CreatedCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
