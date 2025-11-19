'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ChildData {
  id: string
  name: string
  photo?: string
  metrics: {
    overallGPA: number
    attendance: number
    engagement: number
    assignmentsCompleted: number
    averageGrade: number
  }
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

interface ChildComparisonChartProps {
  children: ChildData[]
  metric: 'overallGPA' | 'attendance' | 'engagement' | 'assignmentsCompleted' | 'averageGrade'
  title: string
}

export default function ChildComparisonChart({
  children,
  metric,
  title
}: ChildComparisonChartProps) {
  const maxValue = Math.max(...children.map(child => child.metrics[metric]))

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getMetricColor = (value: number, max: number) => {
    const percentage = (value / max) * 100
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 80) return 'bg-blue-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children.map((child) => {
            const value = child.metrics[metric]
            const percentage = (value / maxValue) * 100

            return (
              <div key={child.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{child.name}</p>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(child.trend)}
                        <span className={`text-xs ${getTrendColor(child.trend)}`}>
                          {child.trendPercentage > 0 ? '+' : ''}{child.trendPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{value}</p>
                    {metric === 'overallGPA' && (
                      <p className="text-xs text-muted-foreground">GPA</p>
                    )}
                    {(metric === 'attendance' || metric === 'engagement') && (
                      <p className="text-xs text-muted-foreground">%</p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full ${getMetricColor(value, maxValue)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Excellent (90%+)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>Good (80-89%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span>Fair (70-79%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span>Needs Improvement (&lt;70%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
