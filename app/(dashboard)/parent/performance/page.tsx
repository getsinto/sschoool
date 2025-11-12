'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  BarChart3,
  Filter,
  Download,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data
const mockPerformanceData = {
  children: [
    { id: '1', name: 'Emma Johnson', grade: 'Grade 10' },
    { id: '2', name: 'Lucas Johnson', grade: 'Grade 8' }
  ],
  selectedChild: {
    id: '1',
    name: 'Emma Johnson',
    overallGPA: 3.8,
    averageGrade: 92,
    trend: 'up',
    trendPercentage: 5,
    courses: [
      {
        id: '1',
        name: 'Advanced Mathematics',
        teacher: 'Dr. Smith',
        progress: 75,
        currentGrade: 95,
        quizAverage: 93,
        assignmentAverage: 96,
        attendance: 98,
        lastActivity: '2 hours ago',
        trend: 'up',
        strengths: ['Problem Solving', 'Calculus'],
        weaknesses: ['Geometry'],
        teacherComments: 'Excellent performance. Shows strong analytical skills.'
      },
      {
        id: '2',
        name: 'Physics 101',
        teacher: 'Prof. Anderson',
        progress: 60,
        currentGrade: 88,
        quizAverage: 85,
        assignmentAverage: 90,
        attendance: 95,
        lastActivity: '1 day ago',
        trend: 'stable',
        strengths: ['Lab Work', 'Theory'],
        weaknesses: ['Mathematical Applications'],
        teacherComments: 'Good progress. Needs to work on problem-solving speed.'
      },
      {
        id: '3',
        name: 'English Literature',
        teacher: 'Ms. Williams',
        progress: 90,
        currentGrade: 96,
        quizAverage: 94,
        assignmentAverage: 97,
        attendance: 100,
        lastActivity: '3 hours ago',
        trend: 'up',
        strengths: ['Writing', 'Analysis', 'Critical Thinking'],
        weaknesses: [],
        teacherComments: 'Outstanding work. Consistently exceeds expectations.'
      }
    ],
    insights: {
      topPerforming: ['English Literature', 'Advanced Mathematics'],
      needsAttention: ['Physics 101'],
      studyPattern: 'Consistent daily study, peak performance in morning hours',
      engagementLevel: 'High',
      recommendations: [
        'Continue current study habits for Math and English',
        'Allocate more time for Physics problem-solving practice',
        'Consider joining advanced placement courses next semester'
      ]
    }
  }
}

export default function PerformancePage() {
  const [selectedChildId, setSelectedChildId] = useState('1')
  const [activeTab, setActiveTab] = useState('overview')
  const data = mockPerformanceData

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600'
    if (grade >= 80) return 'text-blue-600'
    if (grade >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />
    return <div className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Performance</h1>
          <p className="text-gray-600 mt-1">Track your child's academic progress and grades</p>
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

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall GPA</p>
                <p className="text-3xl font-bold text-gray-900">{data.selectedChild.overallGPA}</p>
              </div>
              <Award className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Grade</p>
                <p className={`text-3xl font-bold ${getGradeColor(data.selectedChild.averageGrade)}`}>
                  {data.selectedChild.averageGrade}%
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Performance Trend</p>
                <div className="flex items-center gap-2">
                  {getTrendIcon(data.selectedChild.trend)}
                  <p className="text-2xl font-bold text-green-600">+{data.selectedChild.trendPercentage}%</p>
                </div>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-3xl font-bold text-purple-600">{data.selectedChild.courses.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Details</TabsTrigger>
          <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Course Performance Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.selectedChild.courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <p className="text-sm text-gray-600">Teacher: {course.teacher}</p>
                    </div>
                    {getTrendIcon(course.trend)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Grade</p>
                      <p className={`text-2xl font-bold ${getGradeColor(course.currentGrade)}`}>
                        {course.currentGrade}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={course.progress} className="flex-1" />
                        <span className="text-sm font-semibold">{course.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-xs text-gray-600">Quiz Avg</p>
                      <p className="font-bold text-blue-600">{course.quizAverage}%</p>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <p className="text-xs text-gray-600">Assignment Avg</p>
                      <p className="font-bold text-green-600">{course.assignmentAverage}%</p>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <p className="text-xs text-gray-600">Attendance</p>
                      <p className="font-bold text-purple-600">{course.attendance}%</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Detailed Breakdown
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Course Details Tab */}
        <TabsContent value="courses" className="space-y-4">
          {data.selectedChild.courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <p className="text-sm text-gray-600">Teacher: {course.teacher}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Grade</span>
                        <span className={`font-bold ${getGradeColor(course.currentGrade)}`}>
                          {course.currentGrade}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quiz Average</span>
                        <span className="font-bold">{course.quizAverage}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Assignment Average</span>
                        <span className="font-bold">{course.assignmentAverage}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Attendance Rate</span>
                        <span className="font-bold">{course.attendance}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Course Progress</span>
                        <span className="font-bold">{course.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Strengths & Areas for Improvement</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Strengths:</p>
                        <div className="flex flex-wrap gap-2">
                          {course.strengths.map((strength, index) => (
                            <Badge key={index} variant="default" className="bg-green-100 text-green-700">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {course.weaknesses.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Needs Improvement:</p>
                          <div className="flex flex-wrap gap-2">
                            {course.weaknesses.map((weakness, index) => (
                              <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-700">
                                {weakness}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Teacher's Comments:</p>
                  <p className="text-sm text-blue-800">{course.teacherComments}</p>
                </div>

                <div className="text-xs text-gray-500">
                  Last activity: {course.lastActivity}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Subjects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performing Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.selectedChild.insights.topPerforming.map((subject, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{subject}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-yellow-600" />
                  Subjects Needing Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.selectedChild.insights.needsAttention.map((subject, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <BookOpen className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">{subject}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Study Pattern */}
          <Card>
            <CardHeader>
              <CardTitle>Study Pattern Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{data.selectedChild.insights.studyPattern}</p>
              <div className="mt-4">
                <span className="text-sm text-gray-600">Engagement Level: </span>
                <Badge className="ml-2">{data.selectedChild.insights.engagementLevel}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.selectedChild.insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
