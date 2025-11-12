'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  AlertCircle,
  Users,
  FileText,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

export default function GradingStatisticsPage() {
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [timeRange, setTimeRange] = useState('week')

  // Mock data
  const statistics = {
    summary: {
      totalGraded: 145,
      pendingQuizzes: 8,
      pendingAssignments: 12,
      averageTurnaroundTime: 2.3,
      gradedThisWeek: 45,
      gradedLastWeek: 33
    },
    gradeDistribution: {
      ranges: ['0-59', '60-69', '70-79', '80-89', '90-100'],
      counts: [5, 12, 35, 58, 35],
      percentages: [3.4, 8.3, 24.1, 40.0, 24.1]
    },
    averageGrades: {
      byCourse: [
        { name: 'Grade 10 Mathematics', average: 85.2, count: 45 },
        { name: 'Grade 9 Physics', average: 81.7, count: 38 },
        { name: 'Grade 8 English', average: 88.4, count: 42 }
      ]
    },
    commonIssues: [
      { issue: 'Incomplete methodology', count: 15, percentage: 10.3 },
      { issue: 'Missing citations', count: 22, percentage: 15.2 },
      { issue: 'Weak conclusions', count: 18, percentage: 12.4 },
      { issue: 'Calculation errors', count: 12, percentage: 8.3 }
    ]
  }

  const weekChange = ((statistics.summary.gradedThisWeek - statistics.summary.gradedLastWeek) / statistics.summary.gradedLastWeek * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grading Statistics</h1>
          <p className="text-gray-600 mt-1">Analyze your grading patterns and student performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="course_1">Grade 10 Mathematics</SelectItem>
              <SelectItem value="course_2">Grade 9 Physics</SelectItem>
              <SelectItem value="course_3">Grade 8 English</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Graded</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.summary.totalGraded}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.summary.gradedThisWeek}</div>
              <p className="text-xs text-green-600">
                +{weekChange}% from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Turnaround</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.summary.averageTurnaroundTime}h</div>
              <p className="text-xs text-muted-foreground">
                Average time to grade
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.summary.pendingQuizzes + statistics.summary.pendingAssignments}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.summary.pendingQuizzes} quizzes, {statistics.summary.pendingAssignments} assignments
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.gradeDistribution.ranges.map((range, index) => (
                <div key={range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{range}%</span>
                    <span className="text-gray-600">
                      {statistics.gradeDistribution.counts[index]} students ({statistics.gradeDistribution.percentages[index]}%)
                    </span>
                  </div>
                  <Progress value={statistics.gradeDistribution.percentages[index]} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Grades by Course */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Average Grades by Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.averageGrades.byCourse.map((course) => (
                <div key={course.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{course.name}</span>
                    <span className="text-gray-600">{course.average}% ({course.count} submissions)</span>
                  </div>
                  <Progress value={course.average} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.commonIssues.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.issue}</p>
                    <p className="text-xs text-gray-600">{item.count} occurrences</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grading Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Grading Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold">Improving Students</p>
                    <p className="text-sm text-gray-600">45 students showing improvement</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="font-semibold">Declining Students</p>
                    <p className="text-sm text-gray-600">12 students need attention</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">Stable Performance</p>
                    <p className="text-sm text-gray-600">88 students maintaining grades</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
