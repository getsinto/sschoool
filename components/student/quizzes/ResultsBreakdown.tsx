'use client'

import { CheckCircle, XCircle, Clock, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface Question {
  id: string
  question: string
  type: 'mcq' | 'true_false' | 'short_answer'
  yourAnswer: string
  correctAnswer: string
  isCorrect: boolean
  points: number
  earnedPoints: number
  timeSpent: number
  explanation?: string
}

interface ResultsBreakdownProps {
  score: number
  maxScore: number
  questions: Question[]
  timeSpent: number
  passed: boolean
}

export default function ResultsBreakdown({
  score,
  maxScore,
  questions,
  timeSpent,
  passed
}: ResultsBreakdownProps) {
  const correctCount = questions.filter(q => q.isCorrect).length
  const percentage = Math.round((score / maxScore) * 100)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {percentage}%
            </div>
            <p className="text-gray-600 mb-4">
              {score} out of {maxScore} points
            </p>
            <Badge className={passed ? 'bg-green-600' : 'bg-red-600'}>
              {passed ? 'Passed' : 'Failed'}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{correctCount}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {questions.length - correctCount}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question by Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`p-4 rounded-lg border-2 ${
                question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {question.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">
                      Question {index + 1}: {question.question}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {question.earnedPoints}/{question.points}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(question.timeSpent)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 ml-8">
                <div>
                  <span className="text-sm font-medium text-gray-700">Your Answer: </span>
                  <span className={`text-sm ${question.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {question.yourAnswer}
                  </span>
                </div>

                {!question.isCorrect && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Correct Answer: </span>
                    <span className="text-sm text-green-700 font-medium">
                      {question.correctAnswer}
                    </span>
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-2 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-1">Explanation:</p>
                    <p className="text-sm text-gray-600">{question.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance by Topic */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Accuracy</span>
                <span className="font-semibold">{Math.round((correctCount / questions.length) * 100)}%</span>
              </div>
              <Progress value={(correctCount / questions.length) * 100} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Points Earned</span>
                <span className="font-semibold">{percentage}%</span>
              </div>
              <Progress value={percentage} />
            </div>

            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">
                Average time per question: {formatTime(Math.round(timeSpent / questions.length))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
