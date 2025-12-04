'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import CourseAnalytics from '@/components/admin/courses/CourseAnalytics'
import { 
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  Share2,
  Star,
  Users,
  DollarSign,
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  Eye,
  MessageSquare,
  Settings,
  Globe,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CourseDetails {
  id: string
  title: string
  description: string
  thumbnail: string
  category: 'online-school' | 'spoken-english' | 'tuition'
  grade: string
  subject: string
  teacher: {
    id: string
    name: string
    avatar?: string
    email: string
  }
  price: number
  originalPrice?: number
  enrollments: number
  status: 'draft' | 'published' | 'archived'
  createdDate: string
  lastUpdated: string
  publishedDate?: string
  rating: number
  totalRatings: number
  revenue: number
  completionRate: number
  featured: boolean
  curriculum: {
    sections: Array<{
      id: string
      title: string
      lessons: Array<{
        id: string
        title: string
        duration: number
        type: 'video' | 'text' | 'quiz' | 'assignment'
        completed: number
      }>
    }>
  }
  enrolledStudents: Array<{
    id: string
    name: string
    avatar?: string
    enrolledDate: string
    progress: number
    lastAccessed: string
  }>
  reviews: Array<{
    id: string
    studentName: string
    rating: number
    comment: string
    date: string
  }>
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
}

// Mock course details
const mockCourseDetails: CourseDetails = {
  id: '1',
  title: 'Mathematics Grade 10 - Advanced Algebra',
  description: 'Comprehensive course covering advanced algebraic concepts including quadratic equations, polynomials, and functions. Perfect for Grade 10 students preparing for higher mathematics.',
  thumbnail: '/api/placeholder/400/250',
  category: 'online-school',
  grade: 'Grade 10',
  subject: 'Mathematics',
  teacher: {
    id: 't1',
    name: 'Dr. Sarah Johnson',
    avatar: '/api/placeholder/40/40',
    email: 'sarah.johnson@school.com'
  },
  price: 299,
  originalPrice: 399,
  enrollments: 245,
  status: 'published',
  createdDate: '2024-01-15',
  lastUpdated: '2024-01-20',
  publishedDate: '2024-01-16',
  rating: 4.8,
  totalRatings: 156,
  revenue: 73255,
  completionRate: 78,
  featured: true,
  curriculum: {
    sections: [
      {
        id: 's1',
        title: 'Introduction to Algebra',
        lessons: [
          { id: 'l1', title: 'What is Algebra?', duration: 15, type: 'video', completed: 89 },
          { id: 'l2', title: 'Variables and Constants', duration: 20, type: 'video', completed: 85 },
          { id: 'l3', title: 'Basic Operations Quiz', duration: 10, type: 'quiz', completed: 78 }
        ]
      },
      {
        id: 's2',
        title: 'Linear Equations',
        lessons: [
          { id: 'l4', title: 'Solving Linear Equations', duration: 25, type: 'video', completed: 76 },
          { id: 'l5', title: 'Graphing Linear Functions', duration: 30, type: 'video', completed: 72 },
          { id: 'l6', title: 'Practice Problems', duration: 45, type: 'assignment', completed: 65 }
        ]
      }
    ]
  },
  enrolledStudents: [
    {
      id: 'st1',
      name: 'Alice Johnson',
      avatar: '/api/placeholder/32/32',
      enrolledDate: '2024-01-16',
      progress: 85,
      lastAccessed: '2024-01-20'
    },
    {
      id: 'st2',
      name: 'Bob Smith',
      avatar: '/api/placeholder/32/32',
      enrolledDate: '2024-01-17',
      progress: 72,
      lastAccessed: '2024-01-19'
    }
  ],
  reviews: [
    {
      id: 'r1',
      studentName: 'Alice Johnson',
      rating: 5,
      comment: 'Excellent course! Dr. Johnson explains concepts very clearly.',
      date: '2024-01-18'
    },
    {
      id: 'r2',
      studentName: 'Bob Smith',
      rating: 4,
      comment: 'Good content, but could use more practice problems.',
      date: '2024-01-19'
    }
  ],
  analytics: {
    views: 1250,
    watchTime: 15600, // minutes
    dropOffPoints: [
      { lessonId: 'l3', lessonTitle: 'Basic Operations Quiz', dropOffRate: 22 },
      { lessonId: 'l6', lessonTitle: 'Practice Problems', dropOffRate: 35 }
    ],
    enrollmentTrend: [
      { date: '2024-01-16', enrollments: 45 },
      { date: '2024-01-17', enrollments: 67 },
      { date: '2024-01-18', enrollments: 89 },
      { date: '2024-01-19', enrollments: 156 },
      { date: '2024-01-20', enrollments: 245 }
    ]
  }
}

export default function CourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourse(mockCourseDetails)
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const handlePublishCourse = async () => {
    if (!course) return

    setIsPublishing(true)
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish course')
      }

      // Update local state
      setCourse({ ...course, status: 'published', publishedDate: new Date().toISOString() })
      
      toast({
        title: 'Course Published',
        description: data.notified_students 
          ? `Course published successfully! Notifications sent to ${data.notified_students} enrolled students.`
          : 'Course published successfully!',
        variant: 'default',
      })

      setShowPublishDialog(false)
    } catch (error) {
      console.error('Error publishing course:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish course',
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublishCourse = async () => {
    if (!course) return

    setIsPublishing(true)
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/unpublish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unpublish course')
      }

      // Update local state
      setCourse({ ...course, status: 'draft' })
      
      toast({
        title: 'Course Unpublished',
        description: data.notified_students 
          ? `Course unpublished successfully. ${data.notified_students} students were notified.`
          : 'Course has been unpublished and is no longer visible to students.',
        variant: 'default',
      })

      setShowUnpublishDialog(false)
    } catch (error) {
      console.error('Error unpublishing course:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to unpublish course',
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!course) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course')
      }

      toast({
        title: 'Course Deleted',
        description: data.notified_teachers 
          ? `Course deleted successfully. ${data.notified_teachers} teachers were notified.`
          : 'Course has been permanently deleted.',
        variant: 'default',
      })

      setShowDeleteDialog(false)
      
      // Redirect to courses list after successful deletion
      setTimeout(() => {
        router.push('/admin/courses')
      }, 1500)
    } catch (error) {
      console.error('Error deleting course:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete course',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
        <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const config = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-orange-100 text-orange-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    return config[status as keyof typeof config] || config.draft
  }

  const getCategoryBadge = (category: string) => {
    const config = {
      'online-school': 'bg-blue-100 text-blue-800',
      'spoken-english': 'bg-green-100 text-green-800',
      'tuition': 'bg-purple-100 text-purple-800'
    }
    return config[category as keyof typeof config] || config['online-school']
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusBadge(course.status)}>
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </Badge>
              <Badge className={getCategoryBadge(course.category)}>
                {course.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              {course.featured && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Course
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-3xl font-bold text-blue-600">{course.enrollments}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Generated</p>
                <p className="text-3xl font-bold text-green-600">
                  ${course.revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{course.rating}</p>
                <p className="text-sm text-gray-500">{course.totalRatings} reviews</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{course.completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course Image */}
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{course.description}</p>
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Course Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{course.category.replace('-', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Grade Level:</span>
                          <span className="font-medium">{course.grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium">{course.subject}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">${course.price}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Publishing Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{new Date(course.createdDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">{new Date(course.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        {course.publishedDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Published:</span>
                            <span className="font-medium">{new Date(course.publishedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusBadge(course.status)}>
                            {course.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {course.curriculum.sections.map((section, sectionIndex) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-4">
                          Section {sectionIndex + 1}: {section.title}
                        </h4>
                        <div className="space-y-3">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-500">
                                  {sectionIndex + 1}.{lessonIndex + 1}
                                </span>
                                <div>
                                  <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{lesson.duration} min</span>
                                    </span>
                                    <span className="capitalize">{lesson.type}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {lesson.completed}% completed
                                </div>
                                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${lesson.completed}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Students ({course.enrolledStudents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.enrolledStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {student.avatar ? (
                              <img 
                                src={student.avatar} 
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">
                                {student.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-600">
                              Enrolled: {new Date(student.enrolledDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Last accessed: {new Date(student.lastAccessed).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {student.progress}%
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teachers" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Assigned Teachers</CardTitle>
                    <Button onClick={() => router.push(`/admin/courses/${course.id}/assign-teachers`)}>
                      <Users className="w-4 h-4 mr-2" />
                      Assign More Teachers
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock teacher assignments - will be replaced with real data */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Teacher
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Permissions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assigned Date
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* Primary Teacher */}
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  {course.teacher.avatar ? (
                                    <img 
                                      src={course.teacher.avatar} 
                                      alt={course.teacher.name}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      {course.teacher.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {course.teacher.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {course.teacher.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-blue-100 text-blue-800">
                                <Star className="w-3 h-3 mr-1" />
                                Primary Teacher
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-green-100 text-green-800">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  Content
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Award className="w-3 h-3 mr-1" />
                                  Grading
                                </Badge>
                                <Badge className="bg-orange-100 text-orange-800">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Communication
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(course.createdDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Empty state if no additional teachers */}
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm">No additional teachers assigned to this course</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Click "Assign More Teachers" to add more instructors
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Assignment Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Teachers</p>
                              <p className="text-2xl font-bold text-gray-900">1</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Primary Teacher</p>
                              <p className="text-2xl font-bold text-gray-900">1</p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Content Managers</p>
                              <p className="text-2xl font-bold text-gray-900">1</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews ({course.reviews.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {course.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{review.studentName}</h4>
                            <div className="flex items-center space-x-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-2">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <CourseAnalytics course={course} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Teacher Info & Actions */}
        <div className="space-y-6">
          {/* Teacher Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {course.teacher.avatar ? (
                    <img 
                      src={course.teacher.avatar} 
                      alt={course.teacher.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg text-gray-500">
                      {course.teacher.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{course.teacher.name}</h4>
                  <p className="text-sm text-gray-600">{course.teacher.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Teacher
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.status === 'draft' ? (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setShowPublishDialog(true)}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Publish Course
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowUnpublishDialog(true)}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Unpublishing...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Unpublish Course
                    </>
                  )}
                </Button>
              )}
              
              <Button variant="outline" className="w-full">
                <Star className="w-4 h-4 mr-2" />
                {course.featured ? 'Remove from Featured' : 'Add to Featured'}
              </Button>
              
              <Button variant="outline" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Course
              </Button>
              
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Publish Course
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to publish <strong>{course.title}</strong>?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">What happens when you publish:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Course becomes visible to all students</li>
                      <li>Students can enroll in the course</li>
                      {course.enrollments > 0 && (
                        <li>All {course.enrollments} enrolled students will be notified</li>
                      )}
                      <li>Course appears in search results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublishCourse}
              disabled={isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Publish Course
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Unpublish Course
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to unpublish <strong>{course.title}</strong>?
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-900">
                    <p className="font-medium mb-1">What happens when you unpublish:</p>
                    <ul className="list-disc list-inside space-y-1 text-orange-800">
                      <li>Course becomes hidden from students</li>
                      <li>New students cannot enroll</li>
                      {course.enrollments > 0 && (
                        <li>Existing {course.enrollments} students can still access content</li>
                      )}
                      <li>Course removed from search results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnpublishCourse}
              disabled={isPublishing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unpublishing...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Unpublish Course
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

    
  {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to delete <strong>{course?.title}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-red-900">This action cannot be undone. This will:</p>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Permanently delete the course and all its content</li>
                  <li>Remove all student enrollments</li>
                  <li>Delete all course assignments for teachers</li>
                  <li>Notify all assigned teachers about the deletion</li>
                  <li>Remove all course analytics and data</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                All assigned teachers will receive an email notification about this deletion.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Course
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
