'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface Question {
  id: string
  type: 'mcq' | 'multiple_response' | 'true_false' | 'short_answer'
  text: string
  image?: string
  options?: string[]
  points: number
}

interface QuizInterfaceProps {
  quizId: string
  lessonId: string
  onComplete: (score: number) => void
}

export default function QuizInterface({ quizId, lessonId, onComplete }: QuizInterfaceProps) {
  const [quiz, setQuiz] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)

  // Load quiz
  useEffect(() => {
    fetch(`/api/student/quizzes/${quizId}`)
      .then(res => res.json())
      .then(data => {
        setQuiz(data.data)
        if (data.data.timeLimit) {
          setTimeRemaining(data.data.timeLimit * 60) // Convert to seconds
        }
      })
  }, [quizId])

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmitted) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isSubmitted])

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleSubmit = async () => {
    const response = await fetch(`/api/student/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, timeSpent: quiz.timeLimit * 60 - (timeRemaining || 0) })
    })

    const data = await response.json()
    setResults(data.data)
    setIsSubmitted(true)
    onComplete(data.data.score)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!quiz) {
    return <div className="p-8 text-center">Loading quiz...</div>
  }

  if (isSubmitted && results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">
                {results.percentage}%
              </div>
              <div className="text-xl mb-4">
                {results.score} / {results.totalPoints} points
              </div>
              <div className={`text-lg font-semibold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                {results.passed ? 'Passed!' : 'Not Passed'}
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              {results.questionResults.map((qr: any, index: number) => (
                <Card key={qr.questionId}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      {qr.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">Question {index + 1}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          Your answer: {JSON.stringify(qr.userAnswer)}
                        </p>
                        {!qr.isCorrect && (
                          <p className="text-sm text-green-600 mb-2">
                            Correct answer: {JSON.stringify(qr.correctAnswer)}
                          </p>
                        )}
                        {qr.explanation && (
                          <p className="text-sm text-gray-700 italic">{qr.explanation}</p>
                        )}
                        <p className="text-sm font-medium mt-2">
                          {qr.earnedPoints} / {qr.points} points
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {results.canRetake && (
              <Button className="w-full mt-6" onClick={() => window.location.reload()}>
                Retake Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{quiz.title}</CardTitle>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">{quiz.instructions}</p>
        </CardHeader>

        <CardContent>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{question.text}</h3>
            {question.image && (
              <img src={question.image} alt="Question" className="mb-4 rounded-lg" />
            )}

            {/* Answer Options */}
            {question.type === 'mcq' && (
              <RadioGroup
                value={answers[question.id]}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options?.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={option} id={`q${question.id}-${index}`} />
                    <Label htmlFor={`q${question.id}-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'multiple_response' && (
              <div className="space-y-2">
                {question.options?.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`q${question.id}-${index}`}
                      checked={answers[question.id]?.includes(option)}
                      onCheckedChange={(checked) => {
                        const current = answers[question.id] || []
                        if (checked) {
                          handleAnswerChange(question.id, [...current, option])
                        } else {
                          handleAnswerChange(question.id, current.filter((o: string) => o !== option))
                        }
                      }}
                    />
                    <Label htmlFor={`q${question.id}-${index}`}>{option}</Label>
                  </div>
                ))}
              </div>
            )}

            {question.type === 'true_false' && (
              <RadioGroup
                value={answers[question.id]}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="true" id={`q${question.id}-true`} />
                  <Label htmlFor={`q${question.id}-true`}>True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`q${question.id}-false`} />
                  <Label htmlFor={`q${question.id}-false`}>False</Label>
                </div>
              </RadioGroup>
            )}

            {question.type === 'short_answer' && (
              <Textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={() => handleAnswerChange(question.id, null)}
            >
              Clear Answer
            </Button>

            {currentQuestion < quiz.questions.length - 1 ? (
              <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Submit Quiz
              </Button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium mb-2">Jump to Question:</p>
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((_: any, index: number) => (
                <Button
                  key={index}
                  variant={currentQuestion === index ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentQuestion(index)}
                  className={answers[quiz.questions[index].id] ? 'border-green-500' : ''}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
