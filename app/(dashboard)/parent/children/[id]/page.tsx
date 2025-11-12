'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Award,
  Calendar,
  TrendingUp,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data
const mockChildData = {
  id: '1',
  name: 'Emma Johnson',
  avatar: '/avatars/emma.jpg',
  grade: 'Grade 10',
  age: 15,
  email: 'emma.johnson@student.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, City, State 12345',
  dateOfBirth: '2009-03-15',
  studentId: 'STU-2024-001',
  enrollmentDate: '2023-09-01',
  status: 'active',
  overallProgress: 87,
  averageGrade: 92,
  attendanceRate: 95,
  activeCourses: 5,
  completedCourses: 3,
  totalHoursLearned: 245,
  courses: [
    {
      id: '1',
      title: 'Advanced Mathematics',
      teacher: 'Dr. Smith',
      progress: 75,
      grade: 95,
      status: 'In Progress',
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      title: 'Physics 101',
      teacher: 'Prof. Anderson',
      progress: 60,
      grade: 88,
      status: 'In Progress',
      lastActivity: '1 day ago'
    },
    {
      id: '3',
      title: 'English Literature',
      teacher: 'Ms. Williams',
      progress: 90,
      grade: 96,
      status: 'In Progress',
      lastActivity: '3 hours ago'
    }
  ],
  recentGrades: [
    { subject: 'Mathematics', assignment: 'Calculus Quiz', grade: 95, date: '2024-01-20' },
    { subject: 'Physics', assignment: 'Lab Report', grade: 88, date: '2024-01-18' },
    { subject: 'English', assignment: 'Essay', grade: 96, date: '2024-01-15' }
  ],
  attendance: {
    present: 85,
    absent: 5,
    late: 3,
    total: 93
  },
  behaviorNotes: [
    {
      id: '1',
      teacher: 'Dr. Smith',
      subject: 'Mathematics',
      note: 'Excellent participation in class discussions. Shows strong problem-solving skills.',
      date: '2024-01-15',
      type: 'positive'
    },
    {
      id: '2',
      teacher: 'Prof. Anderson',
      subject: 'Physics',
      note: 'Needs to improve lab report submissions. Often submits late.',
      date: '2024-01-10',
      type: 'concern'
    }
  ]
}

export default function ChildProfilePage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const child = mockChildData

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600'
    if (grade >= 80) return 'text-blue-600'
    if (grade >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/parent/children">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Children
          </Button>
        </Link>
      </div>

      {/* Child Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={child.avatar} />
              <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{child.name}</h1>
                  <p className="text-gray-600">{child.grade} • {child.age} years old</p>
                  <p className="text-sm text-gray-500">Student ID: {child.studentId}</p>
                </div>
                <Badge variant={child.status === 'active' ? 'default' : 'secondary'}>
                  {child.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{child.overallProgress}%</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-green-600">{child.averageGrade}%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold text-purple-600">{child.attendanceRate}%</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-orange-600">{child.activeCourses}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="notes">Behavior & Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{child.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{child.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{child.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Enrollment Date</p>
                    <p className="font-medium">{new Date(child.enrollmentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Courses</span>
                  <span className="font-bold text-lg">{child.activeCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Courses</span>
                  <span className="font-bold text-lg">{child.completedCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Hours Learned</span>
                  <span className="font-bold text-lg">{child.totalHoursLearned}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <span className="font-bold text-lg">{child.overallProgress}%</span>
                </div>
                <div className="pt-4">
                  <Progress value={child.overallProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {child.recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{grade.assignment}</p>
                      <p className="text-xs text-gray-600">{grade.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getGradeColor(grade.grade)}`}>{grade.grade}%</p>
                      <p className="text-xs text-gray-500">{new Date(grade.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          {child.courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <p className="text-sm text-gray-600">Teacher: {course.teacher}</p>
                    <p className="text-xs text-gray-500">Last activity: {course.lastActivity}</p>
                  </div>
                  <Badge>{course.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={course.progress} className="flex-1" />
                      <span className="text-sm font-semibold">{course.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Grade</p>
                    <p className={`text-2xl font-bold ${getGradeColor(course.grade)}`}>{course.grade}%</p>
                  </div>
                </div>

                <Link href={`/dashboard/parent/performance`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Detailed Performance
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Detailed performance analytics</p>
                <Link href="/dashboard/parent/performance">
                  <Button>View Full Performance Report</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{child.attendance.present}</p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{child.attendance.absent}</p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{child.attendance.late}</p>
                  <p className="text-sm text-gray-600">Late</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{child.attendance.total}</p>
                  <p className="text-sm text-gray-600">Total Days</p>
                </div>
              </div>

              <Link href="/dashboard/parent/attendance">
                <Button className="w-full">View Detailed Attendance</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior & Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {child.behaviorNotes.map((note) => (
            <Card key={note.id} className={note.type === 'positive' ? 'border-green-200' : 'border-yellow-200'}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {note.type === 'positive' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{note.subject}</p>
                        <p className="text-sm text-gray-600">By {note.teacher}</p>
                      </div>
                      <Badge variant={note.type === 'positive' ? 'default' : 'secondary'}>
                        {note.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{note.note}</p>
                    <p className="text-xs text-gray-500">{new Date(note.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
