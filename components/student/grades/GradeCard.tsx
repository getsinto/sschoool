'use client'

import { BookOpen, TrendingUp, Award, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface Course {
  id: string
  name: string
  thumbnail: string
  overallGrade: number
  quizzesAverage: number
  assignmentsAverage: number
  participation: number
  grades: Array<{
    id: string
    title: string
    type: 'quiz' | 'assignment'
    grade: number
    maxPoints: number
    date: string
  }>
}

interface GradeCardProps {
  course: Course
}

export default function GradeCard({ course }: GradeCardProps) {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600'
    if (grade >= 80) return 'text-blue-600'
    if (grade >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg" />
            <div>
              <CardTitle>{course.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Overall Grade</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getGradeColor(course.overallGrade)}`}>
              {course.overallGrade}%
            </div>
            <Badge variant="outline" className="mt-1">
              {course.overallGrade >= 90 ? 'A' : course.overallGrade >= 80 ? 'B' : course.overallGrade >= 70 ? 'C' : 'D'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grade Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Quizzes</p>
            <p className="text-2xl font-bold">{course.quizzesAverage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Assignments</p>
            <p className="text-2xl font-bold">{course.assignmentsAverage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Participation</p>
            <p className="text-2xl font-bold">{course.participation}%</p>
          </div>
        </div>

        {/* Recent Grades */}
        <div>
          <h4 className="font-semibold mb-2">Recent Grades</h4>
          <div className="space-y-2">
            {course.grades.map((grade) => (
              <div key={grade.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {grade.type === 'quiz' ? (
                    <Award className="w-4 h-4 text-blue-600" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{grade.title}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(grade.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getGradeColor((grade.grade / grade.maxPoints) * 100)}`}>
                    {grade.grade}/{grade.maxPoints}
                  </p>
                  <p className="text-xs text-gray-600">
                    {((grade.grade / grade.maxPoints) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/dashboard/student/courses/${course.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <BookOpen className="w-4 h-4 mr-2" />
              View Course
            </Button>
          </Link>
          <Link href={`/dashboard/student/grades/${course.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              All Grades
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
