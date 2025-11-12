'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Calendar,
  Phone,
  MapPin,
  Award,
  TrendingUp,
  Clock,
  BookOpen,
  FileText,
  Activity,
  StickyNote
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Mock student data
const mockStudent = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  avatar: '/avatars/sarah.jpg',
  enrollmentDate: '2024-01-10',
  status: 'active',
  overallProgress: 85,
  averageGrade: 92,
  totalCourses: 3,
  completedCourses: 1,
  address: '123 Main St, City, State 12345',
  parent: {
    name: 'Jennifer Johnson',
    email: 'jennifer.j@email.com',
    phone: '+1 (555) 123-4568'
  },
  courses: [
    {
      id: 'c1',
      name: 'Advanced Mathematics',
      thumbnail: '/courses/math.jpg',
      enrolledDate: '2024-01-10',
      progress: 85,
      lessonsCompleted: 17,
      totalLessons: 20,
      averageQuizScore: 94,
      assignmentGrades: [95, 92, 88, 96],
      lastAccessed: '2024-01-20T14:30:00',
      timeSpent: 45 // hours
    },
    {
      id: 'c2',
      name: 'Physics Fundamentals',
      thumbnail: '/courses/physics.jpg',
      enrolledDate: '2024-01-10',
      progress: 92,
      lessonsCompleted: 23,
      totalLessons: 25,
      averageQuizScore: 91,
      assignmentGrades: [90, 93, 89],
      lastAccessed: '2024-01-19T16:45:00',
      timeSpent: 38
    },
    {
      id: 'c3',
      name: 'Chemistry Basics',
      thumbnail: '/courses/chemistry.jpg',
      enrolledDate: '2024-01-15',
      progress: 45,
      lessonsCompleted: 9,
      totalLessons: 20,
      averageQuizScore: 88,
      assignmentGrades: [85, 90],
      lastAccessed: '2024-01-18T10:20:00',
      timeSpent: 15
    }
  ],
  recentActivity: [
    { type: 'lesson', title: 'Completed Lesson 17: Quadratic Equations', date: '2024-01-20T14:30:00' },
    { type: 'quiz', title: 'Scored 94% on Chapter 5 Quiz', date: '2024-01-20T13:15:00' },
    { type: 'assignment', title: 'Submitted Assignment: Problem Set 4', date: '2024-01-19T16:45:00' },
    { type: 'login', title: 'Logged in', date: '2024-01-19T16:30:00' },
    { type: 'lesson', title: 'Completed Lesson 16: Factoring', date: '2024-01-18T15:20:00' }
  ],
  notes: [
    {
      id: 'n1',
      text: 'Excellent participation in class discussions. Shows strong analytical skills.',
      date: '2024-01-18',
      tag: 'achievement'
    },
    {
      id: 'n2',
      text: 'Needs to work on time management for assignments.',
      date: '2024-01-15',
      tag: 'improvement'
    }
  ]
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [newNote, setNewNote] = useState('')
  const [noteTag, setNoteTag] = useState('general')

  const studentId = params.id as string

  const handleAddNote = () => {
    if (newNote.trim()) {
      // TODO: Save note to API
      setNewNote('')
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4" />
      case 'quiz': return <FileText className="w-4 h-4" />
      case 'assignment': return <FileText className="w-4 h-4" />
      case 'login': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'achievement': return 'bg-green-100 text-green-800'
      case 'concern': return 'bg-red-100 text-red-800'
      case 'improvement': return 'bg-yellow-100 text-yellow-800'
      case 'follow-up': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Student Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={mockStudent.avatar} />
              <AvatarFallback>{mockStudent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{mockStudent.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {mockStudent.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {mockStudent.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Enrolled: {new Date(mockStudent.enrollmentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-800">{mockStudent.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 mt-6">
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold">{mockStudent.totalCourses}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold">{mockStudent.overallProgress}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold">{mockStudent.averageGrade}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{mockStudent.completedCourses}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Enrollments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockStudent.courses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{course.name}</h4>
                        <Badge variant="outline">{course.progress}%</Badge>
                      </div>
                      <Progress value={course.progress} className="mb-2" />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{course.lessonsCompleted}/{course.totalLessons} lessons</span>
                        <span>Avg: {course.averageQuizScore}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStudent.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(activity.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parent/Guardian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">{mockStudent.parent.name}</p>
                    <p className="text-sm text-gray-600">{mockStudent.parent.email}</p>
                    <p className="text-sm text-gray-600">{mockStudent.parent.phone}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Parent
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Attendance Rate</span>
                      <span className="font-semibold">95%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Assignment Completion</span>
                      <span className="font-semibold">88%</span>
                    </div>
                    <Progress value={88} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engagement Score</span>
                      <span className="font-semibold">92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {mockStudent.courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{course.name}</h3>
                          <p className="text-sm text-gray-600">
                            Enrolled: {new Date(course.enrolledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="text-lg font-bold">{course.progress}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Lessons</p>
                          <p className="text-lg font-bold">{course.lessonsCompleted}/{course.totalLessons}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quiz Avg</p>
                          <p className="text-lg font-bold">{course.averageQuizScore}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Time Spent</p>
                          <p className="text-lg font-bold">{course.timeSpent}h</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Progress</p>
                        <Progress value={course.progress} />
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Assignment Grades</p>
                        <div className="flex gap-2">
                          {course.assignmentGrades.map((grade, index) => (
                            <Badge key={index} variant="outline">{grade}%</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Chart placeholder - Grade trend over time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quizzes</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <Progress value={92} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Assignments</span>
                    <span className="font-semibold">90%</span>
                  </div>
                  <Progress value={90} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Participation</span>
                    <span className="font-semibold">95%</span>
                  </div>
                  <Progress value={95} />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Strengths & Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-green-600" />
                        Problem-solving skills
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-green-600" />
                        Consistent attendance
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-green-600" />
                        Active participation
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-600 mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-yellow-600" />
                        Time management
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-yellow-600" />
                        Assignment submission timing
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStudent.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-gray-400">
                Calendar heatmap placeholder
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your note about this student..."
                  rows={4}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="tag">Tag</Label>
                  <select
                    id="tag"
                    value={noteTag}
                    onChange={(e) => setNoteTag(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="general">General</option>
                    <option value="achievement">Achievement</option>
                    <option value="concern">Concern</option>
                    <option value="improvement">Improvement</option>
                    <option value="follow-up">Follow-up Needed</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddNote}>
                    <StickyNote className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStudent.notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getTagColor(note.tag)}>{note.tag}</Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(note.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{note.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
