'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Star, BookOpen, Users, MessageSquare, Clock } from 'lucide-react'

interface TeacherStats {
  id: string
  name: string
  coursesCreated: number
  studentsTaught: number
  averageRating: number
  liveClassesConducted: number
  responseTime: number
  gradingTime: number
}

export default function TeacherPerformancePage() {
  const [teachers] = useState<TeacherStats[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      coursesCreated: 8,
      studentsTaught: 245,
      averageRating: 4.8,
      liveClassesConducted: 32,
      responseTime: 2.5,
      gradingTime: 24
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      coursesCreated: 6,
      studentsTaught: 189,
      averageRating: 4.6,
      liveClassesConducted: 28,
      responseTime: 3.2,
      gradingTime: 36
    }
  ])

  const stats = {
    totalTeachers: teachers.length,
    avgRating: teachers.reduce((sum, t) => sum + t.averageRating, 0) / teachers.length,
    totalStudents: teachers.reduce((sum, t) => sum + t.studentsTaught, 0),
    totalCourses: teachers.reduce((sum, t) => sum + t.coursesCreated, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Performance</h1>
          <p className="text-gray-600">Monitor teacher statistics and effectiveness</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold">{stats.totalTeachers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Students Taught</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Teacher</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Courses</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Students</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Live Classes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Response Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Grading Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{teacher.name}</td>
                    <td className="px-4 py-3 text-sm">{teacher.coursesCreated}</td>
                    <td className="px-4 py-3 text-sm">{teacher.studentsTaught}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {teacher.averageRating.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{teacher.liveClassesConducted}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className={teacher.responseTime <= 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {teacher.responseTime}h
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className={teacher.gradingTime <= 24 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {teacher.gradingTime}h
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
