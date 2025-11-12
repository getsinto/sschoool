'use client'

import { HelpCircle, Clock, Award, TrendingUp, RotateCcw, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Quiz {
  id: string
  title: string
  courseId: string
  courseName: string
  questionsCount: number
  duration: number
  maxPoints: number
  attempts: number
  maxAttempts: number
  bestScore: number | null
  lastScore: number | null
  passed: boolean | null
  status: 'available' | 'completed' | 'failed'
}

interface QuizCardProps {
  quiz: Quiz
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const getStatusBadge = () => {
    if (quiz.status === 'available') {
      return <Badge variant="outline">Available</Badge>
    }
    if (quiz.status === 'failed') {
      return <Badge variant="destructive">Failed - Retake Available</Badge>
    }
    if (quiz.passed) {
      return <Badge variant="default">Passed</Badge>
    }
    return <Badge variant="secondary">Completed</Badge>
  }

  const getActionButton = () => {
    if (quiz.status === 'available') {
      return (
        <Link href={`/dashboard/student/quiz/${quiz.courseId}/${quiz.id}`}>
          <Button>Start Quiz</Button>
        </Link>
      )
    }
    
    if (quiz.status === 'failed' && quiz.attempts < quiz.maxAttempts) {
      return (
        <div className="flex gap-2">
          <Link href={`/dashboard/student/quizzes/${quiz.id}/results`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Results
            </Button>
          </Link>
          <Link href={`/dashboard/student/quiz/${quiz.courseId}/${quiz.id}`}>
            <Button size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
          </Link>
        </div>
      )
    }
    
    return (
      <Link href={`/dashboard/student/quizzes/${quiz.id}/results`}>
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          View Results
        </Button>
      </Link>
    )
  }

  const getScorePercentage = (score: number) => {
    return ((score / quiz.maxPoints) * 100).toFixed(1)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{quiz.title}</h3>
              {getStatusBadge()}
            </div>

            <p className="text-sm text-gray-600 mb-3">{quiz.courseName}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* Questions */}
              <div className="flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-gray-600">Questions</p>
                  <p className="font-semibold">{quiz.questionsCount}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-semibold">{quiz.duration} min</p>
                </div>
              </div>

              {/* Max Points */}
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-gray-600">Max Points</p>
                  <p className="font-semibold">{quiz.maxPoints}</p>
                </div>
              </div>

              {/* Attempts */}
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-gray-600">Attempts</p>
                  <p className="font-semibold">
                    {quiz.attempts} of {quiz.maxAttempts}
                  </p>
                </div>
              </div>
            </div>

            {/* Scores */}
            {quiz.bestScore !== null && (
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Best Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {quiz.bestScore}
                    </span>
                    <span className="text-sm text-gray-600">
                      / {quiz.maxPoints} ({getScorePercentage(quiz.bestScore)}%)
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Last Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {quiz.lastScore}
                    </span>
                    <span className="text-sm text-gray-600">
                      / {quiz.maxPoints} ({getScorePercentage(quiz.lastScore!)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pass/Fail Status */}
            {quiz.passed !== null && (
              <div className={`flex items-center gap-2 text-sm mb-3 ${
                quiz.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {quiz.passed ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">Passed</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-semibold">
                      Failed - {quiz.maxAttempts - quiz.attempts} attempt(s) remaining
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="ml-4">
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
