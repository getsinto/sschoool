'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface GradeCardProps {
  course: {
    id: string
    name: string
    instructor: string
    thumbnail?: string
  }
  grade: number
  letterGrade: string
  breakdown: {
    [key: string]: number
  }
  trend?: 'up' | 'down' | 'stable'
}

export default function GradeCard({ course, grade, letterGrade, breakdown, trend }: GradeCardProps) {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600'
    if (grade >= 80) return 'text-blue-600'
    if (grade >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.name}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold">{course.name}</h3>
              <p className="text-sm text-gray-600">{course.instructor}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getGradeColor(grade)}`}>
              {letterGrade}
            </div>
            <div className="text-sm text-gray-600">{grade}%</div>
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            {trend === 'up' && (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Improving</span>
              </>
            )}
            {trend === 'down' && (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600">Declining</span>
              </>
            )}
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Grade Breakdown</h4>
          {Object.entries(breakdown).map(([category, value]) => (
            <div key={category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{category}</span>
                <span className="font-medium">{value}%</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
