'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Flag,
  Award,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

// Mock quiz data
const mockQuizData = {
  id: 'q1',
  title: 'Quadratic Equations - Mid-term Quiz',
  description: 'Test your understanding of quadratic equations, factoring, and the quadratic formula.',
  courseId: 'c1',
  courseName: 'Advanced Mathematics',
  timeLimit: 30, // minutes
  passingScore: 70,
  totalPoints: 100,
  attempts: 2,
  maxAttempts: 3,
  questions: [
    {
      id: 'q1',
      type: 'multiple_choice',
      question: 'What is the standard form of a quadratic equation?',
      points: 10,
      options: [
        { id: 'a', text: 'y = mx + b' },
        { id: 'b', text: 'ax² + bx + c = 0' },
        { id: 'c', text: 'y = a(x-h)² + k' },
        { id: 'd', text: 'x = -b ± √(b²-4ac) / 2a' }
      ],
      correctAnswer: 'b',
      explanation: 'The standard form of a quadratic equation is ax² + bx + c = 0, where a ≠ 0.'
    },
    {
      id: 'q2',
      type: 'multiple_choice',
      question: 'Factor the expression: x² - 9',
      points: 10,
      options: [
        { id: 'a', text: '(x - 3)(x - 3)' },
        { id: 'b', text: '(x + 3)(x + 3)' },
        { id: 'c', text: '(x - 3)(x + 3)' },
        { id: 'd', text: 'Cannot be factored' }
      ],
      correctAnswer: 'c',
      explanation: 'This is a difference of squares: a² - b² = (a-b)(a+b), so x² - 9 = (x-3)(x+3).'
    },
    {
      id: 'q3',
      type: 'multiple_select',
      question: 'Which of the following are perfect square trinomials? (Select all that apply)',
      points: 15,
      options: [
        { id: 'a', text: 'x² + 6x + 9' },
        { id: 'b', text: 'x² + 4x + 4' },
        { id: 'c', text: 'x² + 5x + 6' },
        { id: 'd', text: 'x² - 10x + 25' }
      ],
      correctAnswers: ['a', 'b', 'd'],
      explanation: 'Perfect square trinomials follow the pattern a² ± 2ab + b². Options a, b, and d fit this pattern.'
    },
    {
      id: 'q4',
      type: 'true_false',
      question: 'The discriminant (b² - 4ac) determines the number of real solutions a quadratic equation has.',
      points: 10,
      correctAnswer: true,
      explanation: 'True. If b² - 4ac > 0, there are two real solutions; if = 0, one solution; if < 0, no real solutions.'
    },
    {
      id: 'q5',
      type: 'multiple_choice',
      question: 'Solve for x: x² - 5x + 6 = 0',
      points: 15,
      options: [
        { id: 'a', text: 'x = 1 or x = 6' },
        { id: 'b', text: 'x = 2 or x = 3' },
        { id: 'c', text: 'x = -2 or x = -3' },
        { id: 'd', text: 'x = 5 or x = 1' }
      ],
      correctAnswer: 'b',
      explanation: 'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3.'
    },
    {
      id: 'q6',
      type: 'short_answer',
      question: 'What is the value of the discriminant for the equation 2x² + 3x - 5 = 0?',
      points: 15,
      correctAnswer: '49',
      explanation: 'Using b² - 4ac: (3)² - 4(2)(-5) = 9 + 40 = 49'
    },
    {
      id: 'q7',
      type: 'multiple_choice',
      question: 'Which method is most efficient for solving x² + 8x + 16 = 0?',
      points: 10,
      options: [
        { id: 'a', text: 'Quadratic formula' },
        { id: 'b', text: 'Factoring as a perfect square' },
        { id: 'c', text: 'Completing the square' },
        { id: 'd', text: 'Graphing' }
      ],
      correctAnswer: 'b',
      explanation: 'This is a perfect square trinomial: (x+4)² = 0, so factoring is most efficient.'
    },
    {
      id: 'q8',
      type: 'true_false',
      question: 'Every quadratic equation can be solved by factoring.',
      points: 10,
      correctAnswer: false,
      explanation: 'False. Not all quadratics can be factored with integers. The quadratic formula works for all cases.'
    }
  ]
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string
  const courseId = params.courseId as string

  const [quiz] = useState(mockQuizData)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60) // in seconds
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = quiz.questions[currentQuestionIndex]

  // Timer
  useEffect(() => {
    if (quizStarted && !quizSubmitted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quizStarted, quizSubmitted, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleSubmitQuiz = () => {
    // Calculate score
    let totalScore = 0
    quiz.questions.forEach(q => {
      const userAnswer = answers[q.id]
      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        if (userAnswer === q.correctAnswer) {
          totalScore += q.points
        }
      } else if (q.type === 'multiple_select') {
        const correctSet = new Set(q.correctAnswers)
        const userSet = new Set(userAnswer || [])
        if (correctSet.size === userSet.size && 
            [...correctSet].every(a => userSet.has(a))) {
          totalScore += q.points
        }
      } else if (q.type === 'short_answer') {
        if (userAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase()) {
          totalScore += q.points
        }
      }
    })
    setScore(totalScore)
    setQuizSubmitted(true)
    setShowResults(true)
  }

  const getQuestionStatus = (questionId: string) => {
    if (answers[questionId] !== undefined && answers[questionId] !== null && answers[questionId] !== '') {
      return 'answered'
    }
    return 'unanswered'
  }

  const answeredCount = quiz.questions.filter(q => getQuestionStatus(q.id) === 'answered').length

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{quiz.title}</CardTitle>
                <p className="text-gray-600">{quiz.courseName}</p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Attempt {quiz.attempts + 1} of {quiz.maxAttempts}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">{quiz.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Time Limit</p>
                      <p className="text-xl font-semibold">{quiz.timeLimit} minutes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Passing Score</p>
                      <p className="text-xl font-semibold">{quiz.passingScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Questions</p>
                      <p className="text-xl font-semibold">{quiz.questions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Points</p>
                      <p className="text-xl font-semibold">{quiz.totalPoints}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Important Instructions
              </h4>
              <ul className="text-sm text-gray-700 space-y-1 ml-7">
                <li>• You have {quiz.timeLimit} minutes to complete this quiz</li>
                <li>• The quiz will auto-submit when time runs out</li>
                <li>• You can flag questions for review</li>
                <li>• You can navigate between questions freely</li>
                <li>• Make sure to submit before time expires</li>
              </ul>
            </div>

            <Button onClick={handleStartQuiz} size="lg" className="w-full">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const percentage = Math.round((score / quiz.totalPoints) * 100)
    const passed = percentage >= quiz.passingScore

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center py-8">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${
                passed ? 'bg-green-100' : 'bg-red-100'
              } mb-4`}>
                {passed ? (
                  <CheckCircle className="w-16 h-16 text-green-600" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-600" />
                )}
              </div>
              <h2 className="text-4xl font-bold mb-2">{percentage}%</h2>
              <p className="text-xl text-gray-600 mb-4">
                {score} out of {quiz.totalPoints} points
              </p>
              <Badge variant={passed ? 'default' : 'destructive'} className="text-lg px-4 py-2">
                {passed ? 'Passed' : 'Failed'}
              </Badge>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Question Review</h3>
              {quiz.questions.map((q, index) => {
                const userAnswer = answers[q.id]
                let isCorrect = false

                if (q.type === 'multiple_choice' || q.type === 'true_false') {
                  isCorrect = userAnswer === q.correctAnswer
                } else if (q.type === 'multiple_select') {
                  const correctSet = new Set(q.correctAnswers)
                  const userSet = new Set(userAnswer || [])
                  isCorrect = correctSet.size === userSet.size && 
                              [...correctSet].every(a => userSet.has(a))
                } else if (q.type === 'short_answer') {
                  isCorrect = userAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase()
                }

                return (
                  <Card key={q.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Question {index + 1}</h4>
                            <Badge variant="outline">{q.points} points</Badge>
                          </div>
                          <p className="text-gray-700 mb-3">{q.question}</p>
                          
                          {q.type === 'multiple_choice' && (
                            <div className="space-y-2 mb-3">
                              {q.options?.map(opt => (
                                <div
                                  key={opt.id}
                                  className={`p-2 rounded ${
                                    opt.id === q.correctAnswer
                                      ? 'bg-green-50 border border-green-200'
                                      : opt.id === userAnswer && !isCorrect
                                      ? 'bg-red-50 border border-red-200'
                                      : 'bg-gray-50'
                                  }`}
                                >
                                  {opt.text}
                                  {opt.id === q.correctAnswer && (
                                    <span className="ml-2 text-green-600 text-sm">(Correct)</span>
                                  )}
                                  {opt.id === userAnswer && opt.id !== q.correctAnswer && (
                                    <span className="ml-2 text-red-600 text-sm">(Your answer)</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === 'true_false' && (
                            <div className="mb-3">
                              <p className="text-sm">
                                <span className="font-medium">Your answer:</span> {userAnswer ? 'True' : 'False'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Correct answer:</span> {q.correctAnswer ? 'True' : 'False'}
                              </p>
                            </div>
                          )}

                          {q.type === 'short_answer' && (
                            <div className="mb-3">
                              <p className="text-sm">
                                <span className="font-medium">Your answer:</span> {userAnswer || '(No answer)'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Correct answer:</span> {q.correctAnswer}
                              </p>
                            </div>
                          )}

                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Explanation:</span> {q.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/student/courses/${courseId}`)}
                className="flex-1"
              >
                Back to Course
              </Button>
              {!passed && quiz.attempts < quiz.maxAttempts - 1 && (
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">{quiz.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-semibold text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <Button onClick={handleSubmitQuiz} variant="default">
              Submit Quiz
            </Button>
          </div>
        </div>
        <Progress value={(answeredCount / quiz.questions.length) * 100} className="mt-3" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>Question {currentQuestionIndex + 1}</Badge>
                          <Badge variant="outline">{currentQuestion.points} points</Badge>
                          {flaggedQuestions.has(currentQuestion.id) && (
                            <Badge variant="destructive">
                              <Flag className="w-3 h-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFlag(currentQuestion.id)}
                      >
                        <Flag className={`w-5 h-5 ${
                          flaggedQuestions.has(currentQuestion.id) ? 'fill-red-500 text-red-500' : ''
                        }`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Multiple Choice */}
                    {currentQuestion.type === 'multiple_choice' && (
                      <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                      >
                        {currentQuestion.options?.map(option => (
                          <div key={option.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {/* Multiple Select */}
                    {currentQuestion.type === 'multiple_select' && (
                      <div className="space-y-3">
                        {currentQuestion.options?.map(option => (
                          <div key={option.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
                            <Checkbox
                              id={option.id}
                              checked={(answers[currentQuestion.id] || []).includes(option.id)}
                              onCheckedChange={(checked) => {
                                const current = answers[currentQuestion.id] || []
                                const updated = checked
                                  ? [...current, option.id]
                                  : current.filter((id: string) => id !== option.id)
                                handleAnswer(currentQuestion.id, updated)
                              }}
                            />
                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False */}
                    {currentQuestion.type === 'true_false' && (
                      <RadioGroup
                        value={answers[currentQuestion.id]?.toString() || ''}
                        onValueChange={(value) => handleAnswer(currentQuestion.id, value === 'true')}
                      >
                        <div className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
                          <RadioGroupItem value="true" id="true" />
                          <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
                          <RadioGroupItem value="false" id="false" />
                          <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
                        </div>
                      </RadioGroup>
                    )}

                    {/* Short Answer */}
                    {currentQuestion.type === 'short_answer' && (
                      <input
                        type="text"
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-3 border rounded"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === quiz.questions.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="w-64 border-l bg-gray-50 p-4 overflow-auto">
          <h3 className="font-semibold mb-4">Question Navigator</h3>
          <div className="grid grid-cols-4 gap-2">
            {quiz.questions.map((q, index) => {
              const status = getQuestionStatus(q.id)
              const isFlagged = flaggedQuestions.has(q.id)
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`aspect-square rounded flex items-center justify-center text-sm font-medium relative ${
                    currentQuestionIndex === index
                      ? 'bg-blue-600 text-white'
                      : status === 'answered'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-white border hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                  {isFlagged && (
                    <Flag className="w-3 h-3 absolute top-0.5 right-0.5 fill-red-500 text-red-500" />
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border border-green-200 rounded" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border rounded" />
              <span>Not Answered ({quiz.questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Flagged ({flaggedQuestions.size})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
