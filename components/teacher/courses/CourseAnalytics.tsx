'use client'

import { TrendingUp, Users, Target, Award, Download, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AnalyticsData {
  enrollmentOverTime: Array<{ month: string; enrollments: number }>
  completionFunnel: Array<{ section: string; completed: number; percentage: number }>
  lessonEngagement: Array<{ lesson: string; watchTime: number; completionRate: number; avgDuration: string }>
  quizPerformance: {
    totalQuizzes: number
    averageScore: number
    passRate: number
    topPerformers: number
    needsHelp: number
    scoreDistribution: Array<{ range: string; count: number }>
  }
  dropOffPoints: Array<{ lesson: string; dropRate: number; students: number }>
  studentFeedback: {
    totalReviews: number
    averageRating: number
    ratingDistribution: Record<number, number>
    commonThemes: Array<{ theme: string; mentions: number }>
  }
}

interface CourseAnalyticsProps {
  data: AnalyticsData
  onExport?: (format: string) => void
}

export function CourseAnalytics({ data, onExport }: CourseAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Analytics</h3>
          <p className="text-sm text-gray-600">Detailed performance metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select onValueChange={(format) => onExport?.(format)}>
            <SelectTrigger className="w-40">
              <Download className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">Export as PDF</SelectItem>
              <SelectItem value="csv">Export as CSV</SelectItem>
              <SelectItem value="excel">Export as Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enrollment Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Enrollment Over Time
          </CardTitle>
          <CardDescription>Student enrollment trend over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {data.enrollmentOverTime.map((item, index) => {
              const maxEnrollments = Math.max(...data.enrollmentOverTime.map(d => d.enrollments))
              const height = (item.enrollments / maxEnrollments) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-sm font-semibold text-gray-900">{item.enrollments}</div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-gray-600">{item.month}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Completion Funnel
          </CardTitle>
          <CardDescription>Student progression through course sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.completionFunnel.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">{item.section}</span>
                <span className="text-gray-600">{item.completed} students ({item.percentage}%)</span>
              </div>
              <Progress value={item.percentage} className="h-3" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Lesson Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 w-5 text-purple-600" />
            Lesson Engagement
          </CardTitle>
          <CardDescription>Top 5 lessons by engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-4 font-medium text-gray-900">Lesson</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-900">Views</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-900">Completion</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-900">Avg Duration</th>
                </tr>
              </thead>
              <tbody>
                {data.lessonEngagement.map((lesson, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4 text-gray-900">{lesson.lesson}</td>
                    <td className="py-3 px-4 text-gray-600">{lesson.watchTime}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-600 font-semibold">{lesson.completionRate}%</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{lesson.avgDuration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Quiz Performance
          </CardTitle>
          <CardDescription>Student quiz results and score distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{data.quizPerformance.totalQuizzes}</p>
              <p className="text-xs text-gray-600">Total Quizzes</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.quizPerformance.averageScore}%</p>
              <p className="text-xs text-gray-600">Average Score</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.quizPerformance.passRate}%</p>
              <p className="text-xs text-gray-600">Pass Rate</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{data.quizPerformance.topPerformers}</p>
              <p className="text-xs text-gray-600">Top Performers</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{data.quizPerformance.needsHelp}</p>
              <p className="text-xs text-gray-600">Needs Help</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Score Distribution</h4>
            {data.quizPerformance.scoreDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20">{item.range}</span>
                <div className="flex-1">
                  <Progress
                    value={(item.count / data.quizPerformance.totalQuizzes) * 100}
                    className="h-2"
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Drop-off Points
          </CardTitle>
          <CardDescription>Lessons where students tend to drop off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.dropOffPoints.map((point, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{point.lesson}</p>
                  <p className="text-sm text-gray-600">{point.students} students dropped off</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{point.dropRate}%</p>
                  <p className="text-xs text-gray-600">Drop Rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Feedback Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Student Feedback Summary
          </CardTitle>
          <CardDescription>Common themes from student reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-12">{rating} stars</span>
                    <div className="flex-1">
                      <Progress
                        value={(data.studentFeedback.ratingDistribution[rating] / data.studentFeedback.totalReviews) * 100}
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {data.studentFeedback.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Common Themes</h4>
              <div className="space-y-2">
                {data.studentFeedback.commonThemes.map((theme, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-900">{theme.theme}</span>
                    <span className="text-sm font-medium text-blue-600">{theme.mentions} mentions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}
