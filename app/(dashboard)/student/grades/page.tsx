'use client'

import { useState } from 'react'
import {
  TrendingUp,
  Award,
  Download,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import GradeCard from '@/components/student/grades/GradeCard'
import PerformanceChart from '@/components/student/grades/PerformanceChart'

// Mock data
const mockGradesData = {
  overall: {
    gpa: 3.7,
    percentage: 88.5,
    totalPoints: 885,
    maxPoints: 1000,
    trend: 'up'
  },
  courses: [
    {
      id: 'c1',
      name: 'Advanced Mathematics',
      thumbnail: '/courses/math.jpg',
      overallGrade: 92,
      quizzesAverage: 94,
      assignmentsAverage: 90,
      participation: 95,
      grades: [
        { id: 'g1', title: 'Quadratic Quiz', type: 'quiz', grade: 94, maxPoints: 100, date: '2024-01-22' },
        { id: 'g2', title: 'Problem Set 1', type: 'assignment', grade: 90, maxPoints: 100, date: '2024-01-20' }
      ]
    },
    {
      id: 'c2',
      name: 'Physics Fundamentals',
      thumbnail: '/courses/physics.jpg',
      overallGrade: 85,
      quizzesAverage: 84,
      assignmentsAverage: 86,
      participation: 90,
      grades: [
        { id: 'g3', title: 'Newton\'s Laws Quiz', type: 'quiz', grade: 84, maxPoints: 100, date: '2024-01-21' },
        { id: 'g4', title: 'Lab Report', type: 'assignment', grade: 86, maxPoints: 100, date: '2024-01-19' }
      ]
    }
  ],
  insights: {
    strongest: ['Mathematics', 'Problem Solving'],
    needsImprovement: ['Essay Writing', 'Time Management'],
    classAverage: 82.5,
    achievements: ['Honor Roll', 'Perfect Attendance', 'Top Performer']
  },
  performanceData: [
    { month: 'Aug', grade: 85 },
    { month: 'Sep', grade: 87 },
    { month: 'Oct', grade: 86 },
    { month: 'Nov', grade: 89 },
    { month: 'Dec', grade: 90 },
    { month: 'Jan', grade: 88.5 }
  ]
}

export default function GradesPage() {
  const [data] = useState(mockGradesData)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Grades</h1>
          <p className="text-gray-600">Track your academic performance across all courses</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/student/grades/report">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Report Card
            </Button>
          </Link>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Parents
          </Button>
        </div>
      </div>

      {/* Overall Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">GPA</p>
              <p className="text-4xl font-bold text-blue-600">{data.overall.gpa}</p>
              <p className="text-sm text-gray-600 mt-1">out of 4.0</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Average</p>
              <p className="text-4xl font-bold text-green-600">{data.overall.percentage}%</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Improving</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Points</p>
              <p className="text-4xl font-bold text-purple-600">{data.overall.totalPoints}</p>
              <p className="text-sm text-gray-600 mt-1">of {data.overall.maxPoints}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Class Rank</p>
              <p className="text-4xl font-bold text-orange-600">Top 10%</p>
              <p className="text-sm text-gray-600 mt-1">in your grade</p>
            </div>
          </div>

          {/* Performance Chart */}
          <PerformanceChart data={data.performanceData} />
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strongest Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.insights.strongest.map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.insights.needsImprovement.map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.insights.achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary" className="mr-2 mb-2">
                  {achievement}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades by Course */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Grades by Course</h2>
        <div className="space-y-4">
          {data.courses.map((course) => (
            <div key={course.id}>
              <GradeCard 
                course={{
                  id: course.id,
                  name: course.name,
                  instructor: 'Instructor',
                  thumbnail: course.thumbnail
                }}
                grade={course.overallGrade}
                letterGrade={course.overallGrade >= 90 ? 'A' : course.overallGrade >= 80 ? 'B' : 'C'}
                breakdown={{
                  quizzes: course.quizzesAverage,
                  assignments: course.assignmentsAverage,
                  participation: course.participation
                }}
                trend="up"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
