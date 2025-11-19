'use client'

import { Clock, FileQuestion, Award, RotateCcw, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface QuizCardProps {
  quiz: {
    id: string
    title: string
    courseName: string
    questionsCount: number
    duration?: number
    maxPoints: number
    attempts: number
    maxAttempts: number
    bestScore?: number
    lastScore?: number
    status: 'available' | 'completed' | 'failed'
    passed?: boolean
  }
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const getStatusBadge = () => {
    if (quiz.status === 'available') {
      return <Badge className="bg-blue-100 text-blue-800">Available</Badge>
    }
    if (quiz.passed) {
      return <Badge className="bg-green-100 text-green-800">Passed</Badge>
    }
    return <Badge className="bg-red-100 text-red-800">Need Retake</Badge>
  }

  const getActionButton = () => {
    if (quiz.attempts === 0) {
      return (
        <Link href={`/dashboard/student/learn/${quiz.id}`}>
          <Button className="w-full">Start Quiz</Button>
        </Link>
      )
    }

    if (quiz.attempts < quiz.maxAttempts && !quiz.passed) {
      return (
        <div className="flex gap-2">
          <Link href={`/dashboard/student/quizzes/${quiz.id}/results`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Results
            </Button>
          </Link>
          <Link href={`/dashboard/student/learn/${quiz.id}`} className="flex-1">
            <Button className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <Link href={`/dashboard/student/quizzes/${quiz.id}/results`}>
        <Button variant="outline" className="w-full">
          <Eye className="w-4 h-4 mr-2" />
          View Results
        </Button>
      </Link>
    )
  }

  const scorePercentage = quiz.bestScore ? (quiz.bestScore / quiz.maxPoints) * 100 : 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{quiz.title}</h3>
            <p className="text-sm text-gray-600">{quiz.courseName}</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FileQuestion className="w-4 h-4" />
              <span>{quiz.questionsCount} questions</span>
            </div>
            {quiz.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{quiz.duration} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{quiz.maxPoints} pts</span>
            </div>
          </div>

          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Attempts</span>
              <span className="font-medium">
                {quiz.attempts} of {quiz.maxAttempts}
              </span>
            </div>
            <Progress 
              value={(quiz.attempts / quiz.maxAttempts) * 100} 
              className="h-2"
            />
          </div>

          {quiz.bestScore !== undefined && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Best Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {quiz.bestScore}/{quiz.maxPoints}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className="text-2xl font-bold">
                    {Math.round(scorePercentage)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {quiz.lastScore !== undefined && quiz.lastScore !== quiz.bestScore && (
            <div className="text-sm text-gray-600">
              Last attempt: {quiz.lastScore}/{quiz.maxPoints} ({Math.round((quiz.lastScore / quiz.maxPoints) * 100)}%)
            </div>
          )}
        </div>

        {getActionButton()}
      </CardContent>
    </Card>
  )
}
