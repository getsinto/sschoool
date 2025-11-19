'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AttemptComparisonProps {
  attempts: any[]
}

export default function AttemptComparison({ attempts }: AttemptComparisonProps) {
  const sortedAttempts = [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber)

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'same'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attempt Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAttempts.map((attempt, index) => {
            const previousAttempt = index > 0 ? sortedAttempts[index - 1] : null
            const trend = previousAttempt ? getTrend(attempt.score, previousAttempt.score) : null
            const improvement = previousAttempt ? attempt.score - previousAttempt.score : 0

            return (
              <div key={attempt.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600">#{attempt.attemptNumber}</span>
                    </div>
                    <div>
                      <p className="font-medium">Attempt {attempt.attemptNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{attempt.percentage}%</div>
                    <div className="text-sm text-gray-600">
                      {attempt.score}/{attempt.maxScore}
                    </div>
                  </div>
                </div>

                {trend && (
                  <div className="flex items-center gap-2 text-sm">
                    {trend === 'up' && (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">
                          +{improvement} points improvement
                        </span>
                      </>
                    )}
                    {trend === 'down' && (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">
                          {improvement} points decrease
                        </span>
                      </>
                    )}
                    {trend === 'same' && (
                      <>
                        <Minus className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">No change</span>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Time Spent:</span>
                    <span className="ml-2 font-medium">
                      {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 font-medium ${
                      attempt.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {sortedAttempts.length > 1 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Overall Progress</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">First Attempt:</span>
                <span className="ml-2 font-medium">{sortedAttempts[0].percentage}%</span>
              </div>
              <div>
                <span className="text-gray-600">Latest Attempt:</span>
                <span className="ml-2 font-medium">
                  {sortedAttempts[sortedAttempts.length - 1].percentage}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Best Score:</span>
                <span className="ml-2 font-medium">
                  {Math.max(...sortedAttempts.map(a => a.percentage))}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Improvement:</span>
                <span className="ml-2 font-medium">
                  {sortedAttempts[sortedAttempts.length - 1].percentage - sortedAttempts[0].percentage}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
