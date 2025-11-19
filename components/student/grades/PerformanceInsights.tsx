'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertCircle, Lightbulb, Target } from 'lucide-react'

interface PerformanceInsightsProps {
  insights: {
    strengths?: Array<{
      area: string
      score: number
      description: string
    }>
    weaknesses?: Array<{
      area: string
      score: number
      description: string
    }>
    recommendations?: Array<{
      priority: 'high' | 'medium' | 'low'
      category: string
      suggestion: string
      expectedImpact: string
    }>
    alerts?: Array<{
      type: 'warning' | 'info' | 'success'
      message: string
      action?: string
    }>
  }
}

export default function PerformanceInsights({ insights }: PerformanceInsightsProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800'
  }

  const alertColors = {
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200'
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {insights.alerts && insights.alerts.length > 0 && (
        <div className="space-y-2">
          {insights.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${alertColors[alert.type]}`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  {alert.action && (
                    <p className="text-sm mt-1 text-gray-600">{alert.action}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        {insights.strengths && insights.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.strengths.map((strength, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{strength.area}</h4>
                      <Badge variant="outline" className="bg-green-50">
                        {strength.score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{strength.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weaknesses */}
        {insights.weaknesses && insights.weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.weaknesses.map((weakness, index) => (
                  <div key={index} className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{weakness.area}</h4>
                      <Badge variant="outline" className="bg-yellow-50">
                        {weakness.score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{weakness.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Badge className={priorityColors[rec.priority]}>
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{rec.category}</span>
                      </div>
                      <p className="text-sm mb-2">{rec.suggestion}</p>
                      <p className="text-xs text-gray-600 italic">
                        Expected impact: {rec.expectedImpact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
