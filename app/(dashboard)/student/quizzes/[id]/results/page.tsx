'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Trophy, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ResultsBreakdown from '@/components/student/quizzes/ResultsBreakdown'
import AttemptComparison from '@/components/student/quizzes/AttemptComparison'
import StatCard from '@/components/student/shared/StatCard'

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  
  const [quiz, setQuiz] = useState<any>(null)
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuizResults()
  }, [quizId])

  const loadQuizResults = async () => {
    try {
      setLoading(true)
      
      const quizResponse = await fetch(`/api/student/quizzes/${quizId}`)
      const quizData = await quizResponse.json()
      
      if (quizData.success) {
        setQuiz(quizData.data)
      }

      const attemptsResponse = await fetch(`/api/student/quizzes/${quizId}/attempts`)
      const attemptsData = await attemptsResponse.json()
      
      if (attemptsData.success) {
        setAttempts(attemptsData.data)
      }
    } catch (error) {
      console.error('Failed to load quiz results:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!quiz || attempts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">No results found</p>
          <Button onClick={() => router.push('/student/quizzes')} className="mt-4">
            Back to Quizzes
          </Button>
        </div>
      </div>
    )
  }

  const bestAttempt = attempts.reduce((best, current) => 
    current.score > best.score ? current : best
  , attempts[0])

  const latestAttempt = attempts[attempts.length - 1]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/quizzes')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
          <div>
            <h1 className="text-xl font-bold">{quiz.title}</h1>
            <p className="text-sm text-gray-600">{quiz.courseName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Best Score"
            value={`${bestAttempt.percentage}%`}
            icon={Trophy}
            color="yellow"
          />
          <StatCard
            title="Latest Score"
            value={`${latestAttempt.percentage}%`}
            icon={Target}
            color="blue"
          />
          <StatCard
            title="Attempts"
            value={`${attempts.length}/${quiz.maxAttempts}`}
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Status"
            value={bestAttempt.passed ? 'Passed' : 'Failed'}
            icon={Trophy}
            color={bestAttempt.passed ? 'green' : 'red'}
          />
        </div>

        <ResultsBreakdown attempt={latestAttempt} quiz={quiz} />

        {attempts.length > 1 && (
          <AttemptComparison attempts={attempts} />
        )}

        {!bestAttempt.passed && attempts.length < quiz.maxAttempts && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You have {quiz.maxAttempts - attempts.length} attempt(s) remaining
                </p>
                <Button onClick={() => router.push(`/student/quizzes/${quizId}`)}>
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
