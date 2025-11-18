'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Submission {
  id: string
  student: {
    name: string
    avatar?: string
  }
  score: number
  maxScore: number
  submittedAt: string
  feedback?: string
}

interface SubmissionComparerProps {
  submissions: Submission[]
  currentSubmissionId?: string
  onSelect?: (submissionId: string) => void
}

export default function SubmissionComparer({
  submissions,
  currentSubmissionId,
  onSelect
}: SubmissionComparerProps) {
  const [compareWith, setCompareWith] = useState<string | null>(null)

  const currentSubmission = submissions.find(s => s.id === currentSubmissionId)
  const compareSubmission = submissions.find(s => s.id === compareWith)

  const getPercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100)
  }

  const getScoreDifference = () => {
    if (!currentSubmission || !compareSubmission) return null
    
    const currentPercent = getPercentage(currentSubmission.score, currentSubmission.maxScore)
    const comparePercent = getPercentage(compareSubmission.score, compareSubmission.maxScore)
    const diff = currentPercent - comparePercent

    return {
      value: Math.abs(diff),
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
    }
  }

  const scoreDiff = getScoreDifference()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" />
          Compare Submissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Submission */}
        {currentSubmission && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentSubmission.student.avatar} />
                <AvatarFallback>
                  {currentSubmission.student.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{currentSubmission.student.name}</p>
                <p className="text-xs text-gray-600">Current submission</p>
              </div>
              <Badge variant="outline">
                {getPercentage(currentSubmission.score, currentSubmission.maxScore)}%
              </Badge>
            </div>
          </div>
        )}

        {/* Compare With Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Compare with:</label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {submissions
              .filter(s => s.id !== currentSubmissionId)
              .map((submission) => (
                <button
                  key={submission.id}
                  onClick={() => {
                    setCompareWith(submission.id === compareWith ? null : submission.id)
                    onSelect?.(submission.id)
                  }}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    compareWith === submission.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={submission.student.avatar} />
                      <AvatarFallback>
                        {submission.student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {submission.student.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {getPercentage(submission.score, submission.maxScore)}%
                    </Badge>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Comparison Result */}
        {scoreDiff && compareSubmission && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-sm mb-3">Comparison</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Score difference:</span>
                <div className="flex items-center gap-1">
                  {scoreDiff.trend === 'up' && (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  )}
                  {scoreDiff.trend === 'down' && (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  {scoreDiff.trend === 'same' && (
                    <Minus className="w-4 h-4 text-gray-600" />
                  )}
                  <span className={
                    scoreDiff.trend === 'up' ? 'text-green-600' :
                    scoreDiff.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }>
                    {scoreDiff.value}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current:</span>
                <span className="font-medium">
                  {currentSubmission.score}/{currentSubmission.maxScore}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Comparing with:</span>
                <span className="font-medium">
                  {compareSubmission.score}/{compareSubmission.maxScore}
                </span>
              </div>
            </div>
          </div>
        )}

        {submissions.length <= 1 && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No other submissions to compare</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
