'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  BookOpen, Users, TrendingUp, Star, DollarSign, Edit,
  Save, Flag, Reply
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurriculumTree } from '@/components/teacher/courses/CurriculumTree'
import { StudentProgressTable } from '@/components/teacher/courses/StudentProgressTable'
import { CourseAnalytics } from '@/components/teacher/courses/CourseAnalytics'

// Mock data
const mockCourse = {
  id: '1',
  title: 'Advanced Mathematics',
  description: 'Comprehensive mathematics course covering advanced topics for Grade 10 students',
  thumbnail: '/course-thumbnails/math.jpg',
  category: 'Mathematics',
  grade: 'Grade 10',
  subject: 'Algebra',
  status: 'published',
  price: 49.99,
  totalEnrollments: 245,
  activeStudents: 198,
  completionRate: 78,
  averageRating: 4.8,
  totalRevenue: 12450,
  sections: 8,
  lessons: 42,
  duration: '24 hours'
}

const mockSections = [
  {
    id: '1',
    title: 'Introduction to Algebra',
    order: 1,
    isExpanded: true,
    lessons: [
      { id: '1-1', title: 'What is Algebra?', type: 'video' as const, duration: '12 min', status: 'published' as const, order: 1 },
      { id: '1-2', title: 'Basic Concepts', type: 'text' as const, duration: '8 min', status: 'published' as const, order: 2 },
      { id: '1-3', title: 'Quiz: Introduction', type: 'quiz' as const, duration: '10 min', status: 'published' as const, order: 3 }
    ]
  },
  {
    id: '2',
    title: 'Linear Equations',
    order: 2,
    isExpanded: false,
    lessons: [
      { id: '2-1', title: 'Solving Linear Equations', type: 'video' as const, duration: '18 min', status: 'published' as const, order: 1 },
      { id: '2-2', title: 'Practice Problems', type: 'assignment' as const, duration: '30 min', status: 'draft' as const, order: 2 }
    ]
  }
]

const mockStudents = [
  {
    id: '1', name: 'Sarah Johnson', email: 'sarah@email.com', avatar: '/avatars/sarah.jpg',
    enrolledAt: '2024-01-15', progress: 85, lastActivity: '2024-01-20', quizAverage: 92,
    completedLessons: 36, totalLessons: 42, status: 'active' as const
  },
  {
    id: '2', name: 'Michael Chen', email: 'michael@email.com', avatar: '/avatars/michael.jpg',
    enrolledAt: '2024-01-14', progress: 65, lastActivity: '2024-01-19', quizAverage: 88,
    completedLessons: 27, totalLessons: 42, status: 'active' as const
  }
]

const mockAnalytics = {
  enrollmentOverTime: [
    { month: 'Aug', enrollments: 45 }, { month: 'Sep', enrollments: 62 },
    { month: 'Oct', enrollments: 78 }, { month: 'Nov', enrollments: 95 },
    { month: 'Dec', enrollments: 128 }, { month: 'Jan', enrollments: 245 }
  ],
  completionFunnel: [
    { section: 'Section 1', completed: 245, percentage: 100 },
    { section: 'Section 2', completed: 238, percentage: 97 },
    { section: 'Section 3', completed: 225, percentage: 92 }
  ],
  lessonEngagement: [
    { lesson: 'Introduction to Algebra', watchTime: 245, completionRate: 98, avgDuration: '12 min' },
    { lesson: 'Linear Equations', watchTime: 238, completionRate: 95, avgDuration: '18 min' }
  ],
  quizPerformance: {
    totalQuizzes: 12, averageScore: 85, passRate: 92, topPerformers: 45, needsHelp: 18,
    scoreDistribution: [
      { range: '90-100', count: 98 }, { range: '80-89', count: 75 },
      { range: '70-79', count: 45 }, { range: '60-69', count: 20 }, { range: '0-59', count: 7 }
    ]
  },
  dropOffPoints: [
    { lesson: 'Advanced Factoring', dropRate: 15, students: 37 },
    { lesson: 'Complex Numbers', dropRate: 12, students: 29 }
  ],
  studentFeedback: {
    totalReviews: 156, averageRating: 4.8,
    ratingDistribution: { 5: 78, 4: 52, 3: 18, 2: 6, 1: 2 },
    commonThemes: [
      { theme: 'Clear explanations', mentions: 89 },
      { theme: 'Good examples', mentions: 76 }
    ]
  }
}

const mockReviews = [
  {
    id: '1', student: { name: 'Alex Thompson', avatar: '/avatars/alex.jpg' },
    rating: 5, comment: 'Excellent course! Very well structured.', date: '2024-01-12',
    replies: []
  },
  {
    id: '2', student: { name: 'Jessica Lee', avatar: '/avatars/jessica.jpg' },
    rating: 4, comment: 'Great content, but could use more practice problems.', date: '2024-01-10',
    replies: []
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
            <div className="w-full lg:w-64 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-6xl font-bold">
              {mockCourse.title.charAt(0)}
            </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Students</span>
                  <span className="text-lg font-semibold">{mockCourse.activeStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-lg font-semibold">{mockCourse.completionRate}%</span>
                </div>
                <Progress value={mockCourse.completionRate} className="h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Latest students who joined this course</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>Manage your course structure and lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <CurriculumTree
                sections={mockSections}
                onAddSection={() => console.log('Add section')}
                onAddLesson={(sectionId) => console.log('Add lesson', sectionId)}
                onEditSection={(sectionId) => console.log('Edit section', sectionId)}
                onEditLesson={(sectionId, lessonId) => console.log('Edit lesson', sectionId, lessonId)}
                onDeleteSection={(sectionId) => console.log('Delete section', sectionId)}
                onDeleteLesson={(sectionId, lessonId) => console.log('Delete lesson', sectionId, lessonId)}
              />
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
              <StudentProgressTable
                students={mockStudents}
                onViewProfile={(id) => console.log('View profile', id)}
                onMessage={(id) => console.log('Message', id)}
                onBulkMessage={(ids) => console.log('Bulk message', ids)}
                onExport={() => console.log('Export')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <CourseAnalytics
            data={mockAnalytics}
            onExport={(format) => console.log('Export', format)}
          />
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Course Reviews</CardTitle>
              <CardDescription>Student feedback and ratings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating Filter */}
              <div className="flex gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
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
                    <p className="text-gray-600 ml-12 mb-2">{review.comment}</p>
                    <div className="ml-12 flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Flag className="w-4 h-4 mr-1" />
                        Flag
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Course Title</Label>
                  <Input defaultValue={mockCourse.title} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea defaultValue={mockCourse.description} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input defaultValue={mockCourse.category} />
                  </div>
                  <div>
                    <Label>Grade Level</Label>
                    <Input defaultValue={mockCourse.grade} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Course Price ($)</Label>
                  <Input type="number" defaultValue={mockCourse.price} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Enrollments</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Certificates</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline">Publish Course</Button>
                  <Button variant="outline" className="text-red-600">Archive Course</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
