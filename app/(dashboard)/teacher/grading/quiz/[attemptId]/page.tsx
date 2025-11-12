'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// Mock data
const mockQuizAttempt = {
  id: 'attempt_123',
  student: {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: '/avatars/sarah.jpg'
  },
  quiz: {
    title: 'Mathematics Quiz - Chapter 5: Quadratic Equations',
    course: 'Grade 10 Mathematics',
    totalQuestions: 15,
    totalPoints: 100,
    passingScore: 70,
    timeLimit: 60
  },
  attempt: {
    submittedAt: '2024-01-20T14:30:00',
    timeTaken: 45,
    status: 'pending'
  },
  questions: [
    {
      id: 'q1',
      type: 'mcq',
      question: 'What is the discriminant of the quadratic equation 2x² + 5x + 3 = 0?',
      options: ['1', '7', '25', '49'],
      correctAnswer: 1,
      studentAnswer: 1,
      points: 5,
      isCorrect: true,
      autoGraded: true
    },
    {
      id: 'q2',
      type: 'mcq',
      question: 'Which method is best for solving x² - 6x + 9 = 0?',
      options: ['Quadratic formula', 'Factoring', 'Completing the square', 'Graphing'],
      correctAnswer: 1,
      studentAnswer: 0,
      points: 5,
      isCorrect: false,
      autoGraded: true
    },
    {
      id: 'q3',
      type: 'short_answer',
      question: 'Solve the equation x² - 4x - 5 = 0 and explain your method.',
      sampleAnswer: 'Using factoring: (x-5)(x+1) = 0, so x = 5 or x = -1',
      studentAnswer: 'I factored it as (x-5)(x+1) = 0 so the solutions are x = 5 and x = -1',
      points: 10,
      maxPoints: 10,
      isCorrect: null,
      autoGraded: false,
      feedback: ''
    },
    {
      id: 'q4',
      type: 'short_answer',
      question: 'A ball is thrown upward with initial velocity 20 m/s. The height equation is h = -5t² + 20t. When does the ball hit the ground?',
      sampleAnswer: 'Set h = 0: -5t² + 20t = 0, factor: t(-5t + 20) = 0, so t = 0 or t = 4. The ball hits the ground at t = 4 seconds.',
      studentAnswer: 'When h = 0, so -5t² + 20t = 0. Factoring gives t(-5t + 20) = 0, so t = 0 or t = 4 seconds.',
      points: 15,
      maxPoints: 15,
      isCorrect: null,
      autoGraded: false,
      feedback: ''
    }
  ]
}

export default function QuizGradingPage() {
  const params = useParams()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [grades, setGrades] = useState<{[key: string]: {points: number, feedback: string}}>({})
  const [overallFeedback, setOverallFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const attemptId = params.attemptId as string
  const questions = mockQuizAttempt.questions
  const currentQ = questions[currentQuestion]

  // Calculate scores
  const autoGradedPoints = questions
    .filter(q => q.autoGraded)
    .reduce((sum, q) => sum + (q.isCorrect ? q.points : 0), 0)
  
  const manualPoints = questions
    .filter(q => !q.autoGraded)
    .reduce((sum, q) => {
      const grade = grades[q.id]
      return sum + (grade ? grade.points : 0)
    }, 0)
  
  const totalEarned = autoGradedPoints + manualPoints
  const totalPossible = mockQuizAttempt.quiz.totalPoints
  const percentage = Math.round((totalEarned / totalPossible) * 100)
  const isPassing = percentage >= mockQuizAttempt.quiz.passingScore

  const handleGradeChange = (questionId: string, points: number, feedback: string) => {
    setGrades(prev => ({
      ...prev,
      [questionId]: { points, feedback }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Save to API
    setTimeout(() => setIsSaving(false), 1000)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitGrade = async () => {
    setIsSaving(true)
    // TODO: Submit final grade
    setTimeout(() => {
      setIsSaving(false)
      router.push('/dashboard/teacher/grading')
    }, 1000)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'n' && !e.ctrlKey) {
        handleNext()
      } else if (e.key === 'p' && !e.ctrlKey) {
        handlePrevious()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentQuestion])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grade Quiz Submission</h1>
            <p className="text-gray-600">{mockQuizAttempt.quiz.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={handleSubmitGrade} disabled={isSaving}>
            Submit Grade
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Info & Quiz Details */}
        <div className="lg:col-span-1 space-y-4">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={mockQuizAttempt.student.avatar} />
                  <AvatarFallback>{mockQuizAttempt.student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{mockQuizAttempt.student.name}</p>
                  <p className="text-sm text-gray-600">{mockQuizAttempt.student.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span>{mockQuizAttempt.quiz.course}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>{mockQuizAttempt.quiz.totalQuestions} questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Time taken: {mockQuizAttempt.attempt.timeTaken}/{mockQuizAttempt.quiz.timeLimit} min</span>
              </div>
              <div className="text-sm">
                <span>Submitted: {new Date(mockQuizAttempt.attempt.submittedAt).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {totalEarned}/{totalPossible}
                </div>
                <div className="text-lg font-semibold">{percentage}%</div>
                <Progress value={percentage} className="mt-2" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Auto-graded (MCQ):</span>
                  <span>{autoGradedPoints} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Manual grading:</span>
                  <span>{manualPoints} pts</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{totalEarned} pts</span>
                </div>
              </div>

              <div className="text-center">
                <Badge className={isPassing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {isPassing ? (
                    <><CheckCircle className="w-4 h-4 mr-1" /> PASS</>
                  ) : (
                    <><XCircle className="w-4 h-4 mr-1" /> FAIL</>
                  )}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">
                  Passing score: {mockQuizAttempt.quiz.passingScore}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Question Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`
                      p-2 text-sm rounded border transition-colors
                      ${currentQuestion === index 
                        ? 'bg-blue-100 border-blue-300 text-blue-900' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }
                      ${q.autoGraded 
                        ? (q.isCorrect ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500')
                        : 'border-l-4 border-l-yellow-500'
                      }
                    `}
                  >
                    Q{index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Review */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Question {currentQuestion + 1} of {questions.length}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNext}
                    disabled={currentQuestion === questions.length - 1}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">
                    {currentQ.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                  </Badge>
                  <Badge variant="outline">
                    {currentQ.points} points
                  </Badge>
                  {currentQ.autoGraded && (
                    <Badge className={currentQ.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {currentQ.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
              </div>

              {/* MCQ Question */}
              {currentQ.type === 'mcq' && (
                <div className="space-y-3">
                  <h4 className="font-medium">Answer Options:</h4>
                  {currentQ.options?.map((option, index) => (
                    <div 
                      key={index}
                      className={`
                        p-3 rounded border
                        ${index === currentQ.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
                        ${index === currentQ.studentAnswer ? 'ring-2 ring-blue-300' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                        {index === currentQ.correctAnswer && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                        {index === currentQ.studentAnswer && index !== currentQ.correctAnswer && (
                          <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="text-sm text-gray-600">
                    <strong>Student selected:</strong> {String.fromCharCode(65 + (currentQ.studentAnswer || 0))}. {currentQ.options?.[currentQ.studentAnswer || 0]}
                  </div>
                </div>
              )}

              {/* Short Answer Question */}
              {currentQ.type === 'short_answer' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Student's Answer:</h4>
                    <div className="p-4 bg-gray-50 rounded border">
                      {currentQ.studentAnswer}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Sample Answer:</h4>
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                      {currentQ.sampleAnswer}
                    </div>
                  </div>

                  {/* Grading */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`points-${currentQ.id}`}>Points Earned</Label>
                      <Input
                        id={`points-${currentQ.id}`}
                        type="number"
                        min="0"
                        max={currentQ.maxPoints}
                        value={grades[currentQ.id]?.points || ''}
                        onChange={(e) => handleGradeChange(
                          currentQ.id, 
                          parseInt(e.target.value) || 0, 
                          grades[currentQ.id]?.feedback || ''
                        )}
                        placeholder={`0 - ${currentQ.maxPoints}`}
                      />
                      <p className="text-xs text-gray-600 mt-1">Max: {currentQ.maxPoints} points</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`feedback-${currentQ.id}`}>Feedback for Student</Label>
                    <Textarea
                      id={`feedback-${currentQ.id}`}
                      value={grades[currentQ.id]?.feedback || ''}
                      onChange={(e) => handleGradeChange(
                        currentQ.id, 
                        grades[currentQ.id]?.points || 0, 
                        e.target.value
                      )}
                      placeholder="Provide specific feedback on the student's answer..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overall Feedback */}
          {currentQuestion === questions.length - 1 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Overall Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  placeholder="Provide overall feedback for the student's quiz performance..."
                  rows={4}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4">
        <Card className="p-3">
          <div className="text-xs text-gray-600 space-y-1">
            <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+S</kbd> Save</div>
            <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">N</kbd> Next</div>
            <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">P</kbd> Previous</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
