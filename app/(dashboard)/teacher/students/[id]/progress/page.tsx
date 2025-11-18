'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  MessageSquare,
  Calendar,
  FileText,
  Award,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

// Mock data
const mockStudentProgress = {
  student: {
    id: 's1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: '/avatars/sarah.jpg',
    enrolledDate: '2024-01-15'
  },
  overallStats: {
    averageGrade: 92,
    completionRate: 85,
    attendanceRate: 95,
    submissionsOnTime: 18,
    submissionsLate: 2,
    submissionsMissing: 1
  },
  submissions: [
    {
      id: 'sub1',
      title: 'Algebra Quiz 1',
      type: 'quiz',
      course: 'Mathematics',
      submittedAt: '2024-01-20T10:30:00',
      dueDate: '2024-01-20T23:59:00',
      score: 95,
      maxScore: 100,
      status: 'graded'
    },
    {
      id: 'sub2',
      title: 'Physics Lab Report',
      type: 'assignment',
      course: 'Physics',
      submittedAt: '2024-01-18T16:45:00',
      dueDate: '2024-01-19T23:59:00',
      score: 88,
      maxScore: 100,
      status: 'graded'
    },
    {
      id: 'sub3',
      title: 'English Essay',
      type: 'assignment',
      course: 'English',
      submittedAt: '2024-01-15T14:20:00',
      dueDate: '2024-01-16T23:59:00',
      score: 92,
      maxScore: 100,
      status: 'graded'
    }
  ],
  gradesTrend: [
    { month: 'Sep', average: 85 },
    { month: 'Oct', average: 88 },
    { month: 'Nov', average: 90 },
    { month: 'Dec', average: 92 }
  ],
  strengths: [
    'Excellent analytical skills',
    'Consistent high performance in mathematics',
    'Strong written communication'
  ],
  weaknesses: [
    'Occasional late submissions',
    'Could improve time management'
  ],
  teacherNotes: []
}

export default function StudentProgressPage() {
  const params = useParams()
  const router = useRouter()
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState(mockStudentProgress.teacherNotes)

  const studentId = params.id as string

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, {
        id: Date.now().toString(),
        text: newNote,
        date: new Date().toISOString(),
        author: 'Current Teacher'
      }])
      setNewNote('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'late': return 'bg-red-100 text-red-800'
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
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={mockStudentProgress.student.avatar} />
              <AvatarFallback>{mockStudentProgress.student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mockStudentProgress.student.name}</h1>
              <p className="text-gray-600">{mockStudentProgress.student.email}</p>
              <p className="text-sm text-gray-500">
                Enrolled: {new Date(mockStudentProgress.student.enrolledDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Student
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {mockStudentProgress.overallStats.averageGrade}%
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>+5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStudentProgress.overallStats.completionRate}%</div>
            <Progress value={mockStudentProgress.overallStats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {mockStudentProgress.overallStats.attendanceRate}%
            </div>
            <Progress value={mockStudentProgress.overallStats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">On Time:</span>
                <span className="font-semibold text-green-600">
                  {mockStudentProgress.overallStats.submissionsOnTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Late:</span>
                <span className="font-semibold text-yellow-600">
                  {mockStudentProgress.overallStats.submissionsLate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Missing:</span>
                <span className="font-semibold text-red-600">
                  {mockStudentProgress.overallStats.submissionsMissing}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grade Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Grade Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStudentProgress.gradesTrend.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.month}</span>
                      <span className="text-gray-600">{item.average}%</span>
                    </div>
                    <Progress value={item.average} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStudentProgress.submissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{submission.title}</h4>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{submission.course}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                          <span>Due: {new Date(submission.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {submission.score}/{submission.maxScore}
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round((submission.score / submission.maxScore) * 100)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Strengths & Weaknesses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-green-600 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {mockStudentProgress.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-yellow-600 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {mockStudentProgress.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teacher Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this student..."
                  rows={3}
                />
                <Button 
                  onClick={handleAddNote} 
                  className="mt-2 w-full"
                  disabled={!newNote.trim()}
                >
                  Add Note
                </Button>
              </div>

              {notes.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notes.map((note: any) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{note.text}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>{note.author}</span>
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {notes.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No notes yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
