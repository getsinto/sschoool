'use client'

import { 
  TrendingUp,
  Users,
  Target,
  Award,
  Download,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface AnalyticsData {
  enrollmentTrend: Array<{ month: string; enrollments: number }>
  completionFunnel: Array<{ section: string; completed: number; percentage: number }>
  lessonEngagement: Array<{ lesson: string; watchTime: number; completionRate: number }>
  quizPerformance: {
    averageScore: number
    passRate: number
    totalAttempts: number
    perfectScores: number
  }
  dropOffPoints: Array<{ lesson: string; dropRate: number }>
  ratingBreakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

interface CourseAnalyticsProps {
  data: AnalyticsData
  onExport?: () => void
}

export function CourseAnalytics({ data, onExport }: CourseAnalyticsProps) {
  const totalRatings = Object.values(data.ratingBreakdown).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Course Analytics</h3>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Enrollment Trend */}
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
            {data.enrollmentTrend.map((item, index) => {
              const maxEnrollments = Math.max(...data.enrollmentTrend.map(d => d.enrollments))
              const height = (item.enrollments / maxEnrollments) * 100
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-sm font-medium text-gray-900">{item.enrollments}</div>
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
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
          <CardDescription>How many students complete each section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.completionFunnel.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">{item.section}</span>
                <span className="text-sm text-gray-600">
                  {item.completed} students ({item.percentage}%)
                </span>
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
            <Users className="w-5 h-5 text-purple-600" />
            Lesson Engagement
          </CardTitle>
          <CardDescription>Watch time and completion rate per lesson</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Lesson</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Watch Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.lessonEngagement.map((lesson, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4 text-gray-900">{lesson.lesson}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={lesson.watchTime} className="h-2 flex-1" />
                        <span className="text-sm text-gray-600">{lesson.watchTime}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={lesson.completionRate} className="h-2 flex-1" />
                        <span className="text-sm text-gray-600">{lesson.completionRate}%</span>
                      </div>
                    </td>
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
            Quiz Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{data.quizPerformance.averageScore}%</p>
              <p className="text-sm text-gray-600 mt-1">Average Score</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{data.quizPerformance.passRate}%</p>
              <p className="text-sm text-gray-600 mt-1">Pass Rate</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{data.quizPerformance.totalAttempts}</p>
              <p className="text-sm text-gray-600 mt-1">Total Attempts</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{data.quizPerformance.perfectScores}</p>
              <p className="text-sm text-gray-600 mt-1">Perfect Scores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Drop-off Points Analysis
          </CardTitle>
          <CardDescription>Lessons where students tend to drop off</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.dropOffPoints.map((point, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-900">{point.lesson}</span>
              <span className="text-red-600 font-semibold">{point.dropRate}% drop rate</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rating Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Breakdown</CardTitle>
          <CardDescription>Distribution of student ratings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = data.ratingBreakdown[rating as keyof typeof data.ratingBreakdown]
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900 w-12">
                  {rating} stars
                </span>
                <Progress value={percentage} className="h-3 flex-1" />
                <span className="text-sm text-gray-600 w-16 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
