'use client'

import { useState } from 'react'
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

// Mock data
const mockAttendanceData = {
  children: [
    { id: '1', name: 'Emma Johnson', grade: 'Grade 10' },
    { id: '2', name: 'Lucas Johnson', grade: 'Grade 8' }
  ],
  selectedChild: {
    id: '1',
    name: 'Emma Johnson',
    summary: {
      overallRate: 95,
      present: 85,
      absent: 3,
      late: 5,
      totalDays: 93
    },
    byCourse: [
      {
        id: '1',
        course: 'Advanced Mathematics',
        teacher: 'Dr. Smith',
        attendanceRate: 98,
        present: 28,
        absent: 0,
        late: 1,
        total: 29,
        missedClasses: []
      },
      {
        id: '2',
        course: 'Physics 101',
        teacher: 'Prof. Anderson',
        attendanceRate: 92,
        present: 25,
        absent: 2,
        late: 1,
        total: 28,
        missedClasses: [
          { date: '2024-01-15', reason: 'Sick', recordingWatched: true },
          { date: '2024-01-08', reason: 'Family Emergency', recordingWatched: false }
        ]
      },
      {
        id: '3',
        course: 'English Literature',
        teacher: 'Ms. Williams',
        attendanceRate: 100,
        present: 30,
        absent: 0,
        late: 0,
        total: 30,
        missedClasses: []
      }
    ],
    recentClasses: [
      {
        id: '1',
        course: 'Advanced Mathematics',
        date: '2024-01-22',
        scheduledTime: '10:00 AM',
        joinTime: '10:02 AM',
        duration: 58,
        status: 'present'
      },
      {
        id: '2',
        course: 'Physics 101',
        date: '2024-01-21',
        scheduledTime: '2:00 PM',
        joinTime: '2:15 PM',
        duration: 45,
        status: 'late'
      },
      {
        id: '3',
        course: 'English Literature',
        date: '2024-01-20',
        scheduledTime: '11:00 AM',
        joinTime: '11:00 AM',
        duration: 60,
        status: 'present'
      },
      {
        id: '4',
        course: 'Physics 101',
        date: '2024-01-15',
        scheduledTime: '2:00 PM',
        joinTime: null,
        duration: 0,
        status: 'absent'
      }
    ]
  }
}

export default function AttendancePage() {
  const [selectedChildId, setSelectedChildId] = useState('1')
  const data = mockAttendanceData

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-700">Present</Badge>
      case 'absent':
        return <Badge className="bg-red-100 text-red-700">Absent</Badge>
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-700">Late</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 85) return 'text-blue-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor your child's class attendance</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} - {child.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-gray-600">Overall Rate</p>
                <p className={`text-3xl font-bold ${getAttendanceColor(data.selectedChild.summary.overallRate)}`}>
                  {data.selectedChild.summary.overallRate}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
            <Progress value={data.selectedChild.summary.overallRate} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-3xl font-bold text-green-600">{data.selectedChild.summary.present}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-3xl font-bold text-red-600">{data.selectedChild.summary.absent}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-3xl font-bold text-yellow-600">{data.selectedChild.summary.late}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance by Course */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.selectedChild.byCourse.map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{course.course}</h3>
                    <p className="text-sm text-gray-600">Teacher: {course.teacher}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getAttendanceColor(course.attendanceRate)}`}>
                      {course.attendanceRate}%
                    </p>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-green-50 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{course.present}</p>
                    <p className="text-xs text-gray-600">Present</p>
                  </div>
                  <div className="bg-red-50 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{course.absent}</p>
                    <p className="text-xs text-gray-600">Absent</p>
                  </div>
                  <div className="bg-yellow-50 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{course.late}</p>
                    <p className="text-xs text-gray-600">Late</p>
                  </div>
                  <div className="bg-blue-50 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{course.total}</p>
                    <p className="text-xs text-gray-600">Total Classes</p>
                  </div>
                </div>

                {course.missedClasses.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm font-semibold text-red-900 mb-2">Missed Classes:</p>
                    <div className="space-y-2">
                      {course.missedClasses.map((missed, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-red-800">
                            {new Date(missed.date).toLocaleDateString()} - {missed.reason}
                          </span>
                          <Badge variant={missed.recordingWatched ? 'default' : 'secondary'}>
                            {missed.recordingWatched ? 'Recording Watched' : 'Recording Not Watched'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.selectedChild.recentClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {classItem.status === 'present' && <CheckCircle className="w-6 h-6 text-green-600" />}
                  {classItem.status === 'absent' && <XCircle className="w-6 h-6 text-red-600" />}
                  {classItem.status === 'late' && <Clock className="w-6 h-6 text-yellow-600" />}
                  
                  <div>
                    <p className="font-semibold">{classItem.course}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(classItem.date).toLocaleDateString()} at {classItem.scheduledTime}
                    </p>
                    {classItem.joinTime && (
                      <p className="text-xs text-gray-500">
                        Joined at {classItem.joinTime} • Duration: {classItem.duration} min
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  {getStatusBadge(classItem.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
