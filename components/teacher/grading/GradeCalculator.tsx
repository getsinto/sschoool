'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface GradeCalculatorProps {
  earnedPoints: number
  totalPoints: number
  latePenalty?: number
  bonusPoints?: number
  passingScore?: number
  showBreakdown?: boolean
  autoGradedPoints?: number
  manualPoints?: number
}

export default function GradeCalculator({
  earnedPoints,
  totalPoints,
  latePenalty = 0,
  bonusPoints = 0,
  passingScore = 70,
  showBreakdown = true,
  autoGradedPoints,
  manualPoints
}: GradeCalculatorProps) {
  const finalScore = Math.max(0, earnedPoints - latePenalty + bonusPoints)
  const percentage = totalPoints > 0 ? Math.round((finalScore / totalPoints) * 100) : 0
  const isPassing = percentage >= passingScore

  const getGradeLetter = (percent: number) => {
    if (percent >= 90) return 'A'
    if (percent >= 80) return 'B'
    if (percent >= 70) return 'C'
    if (percent >= 60) return 'D'
    return 'F'
  }

  const getGradeColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600'
    if (percent >= 80) return 'text-blue-600'
    if (percent >= 70) return 'text-yellow-600'
    if (percent >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Grade Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score Display */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">
            {finalScore}/{totalPoints}
          </div>
          <div className={`text-3xl font-semibold mt-2 ${getGradeColor(percentage)}`}>
            {percentage}% ({getGradeLetter(percentage)})
          </div>
          <Progress value={percentage} className="mt-4" />
        </div>

        {/* Pass/Fail Status */}
        <div className="text-center">
          <Badge className={isPassing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {isPassing ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                PASS
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-1" />
                FAIL
              </>
            )}
          </Badge>
          <p className="text-xs text-gray-600 mt-2">
            Passing score: {passingScore}%
          </p>
        </div>

        {/* Breakdown */}
        {showBreakdown && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              {autoGradedPoints !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto-graded:</span>
                  <span className="font-medium">{autoGradedPoints} pts</span>
                </div>
              )}
              {manualPoints !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Manual grading:</span>
                  <span className="font-medium">{manualPoints} pts</span>
                </div>
              )}
              {(autoGradedPoints !== undefined || manualPoints !== undefined) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{earnedPoints} pts</span>
                </div>
              )}
              {latePenalty > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Late penalty:</span>
                  <span className="font-medium">-{latePenalty} pts</span>
                </div>
              )}
              {bonusPoints > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Bonus points:</span>
                  <span className="font-medium">+{bonusPoints} pts</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Final Score:</span>
                <span>{finalScore} pts</span>
              </div>
            </div>
          </>
        )}

        {/* Warning for low scores */}
        {!isPassing && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Below passing score</p>
              <p className="text-xs mt-1">
                Student needs {Math.ceil((passingScore * totalPoints / 100) - finalScore)} more points to pass
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
