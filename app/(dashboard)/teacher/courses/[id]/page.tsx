'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Users,
  TrendingUp,
  Star,
  DollarSign,
  Edit,
  Settings,
  BarChart3,
  MessageSquare,
  List,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

// Mock course data
const mockCourse = {
  id: '1',
  title: 'Advanced Mathematics',
  description: 'Comprehensive mathematics course covering advanced topics for Grade 10 students',
  thumbnail: '/course-thumbnails/math.jpg',
  category: 'Mathematics',
  grade: 'Grade 10',
  subject: 'Algebra',
  status: 'published',
  totalEnrollments: 245,
  activeStudents: 198,
  completionRate: 78,
  averageRating: 4.8,
  totalRevenue: 12450,
  sections: 8,
  lessons: 42,
  duration: '24 hours'
}

const mockRecentEnrollments = [
  {
    id: 1,
    student: { name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg' },
    enrolledAt: '2024-01-15',
    progress: 15
  },
  {
    id: 2,
    student: { name: 'Michael Chen', avatar: '/avatars/michael.jpg' },
    enrolledAt: '2024-01-14',
    progress: 8
  },
  {
    id: 3,
    student: { name: 'Emma Davis', avatar: '/avatars/emma.jpg' },
    enrolledAt: '2024-01-14',
    progress: 22
  }
]

const mockRecentReviews = [
  {
    id: 1,
    student: { name: 'Alex Thompson', avatar: '/avatars/alex.jpg' },
    rating: 5,
    comment: 'Excellent course! Very well structured and easy to follow.',
    date: '2024-01-12'
  },
  {
    id: 2,
    student: { name: 'Jessica Lee', avatar: '/avatars/jessica.jpg' },
    rating: 4,
    comment: 'Great content, but could use more practice problems.',
    date: '2024-01-10'
  }
]

export default function CourseDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Thumbnail */}
            <div className="w-full lg:w-64 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-6xl font-bold">
              {mockCourse.title.charAt(0)}
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{mockCourse.title}</h1>
                  <p className="text-gray-600 mb-3">{mockCourse.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{mockCourse.category}</Badge>
                    <Badge variant="outline">{mockCourse.grade}</Badge>
                    <Badge variant="outline">{mockCourse.subject}</Badge>
                    <Badge className="bg-green-100 text-green-800">{mockCourse.status}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{mockCourse.totalEnrollments}</p>
                  <p className="text-xs text-gray-600">Enrollments</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{mockCourse.completionRate}%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{mockCourse.averageRating}</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">${mockCourse.totalRevenue}</p>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{mockCourse.lessons}</p>
                  <p className="text-xs text-gray-600">Lessons</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Course performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Students</span>
                  <span className="text-lg font-semibold">{mockCourse.activeStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-lg font-semibold">{mockCourse.completionRate}%</span>
                </div>
                <Progress value={mockCourse.completionRate} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Course Duration</span>
                  <span className="text-lg font-semibold">{mockCourse.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sections</span>
                  <span className="text-lg font-semibold">{mockCourse.sections}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
                <CardDescription>Latest students who joined</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRecentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={enrollment.student.avatar} />
                        <AvatarFallback>{enrollment.student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.student.name}</p>
                        <p className="text-sm text-gray-500">{enrollment.enrolledAt}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{enrollment.progress}%</p>
                      <p className="text-xs text-gray-500">Progress</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  View All Students
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest feedback from students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentReviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.student.avatar} />
                        <AvatarFallback>{review.student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{review.student.name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-600 ml-12">{review.comment}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View All Reviews
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>Manage your course structure</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                Curriculum management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>Manage and track student progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                Student management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>Detailed performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                Analytics dashboard will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Course Reviews</CardTitle>
              <CardDescription>Student feedback and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                Reviews management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>Configure course options</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                Settings interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
