'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Question {
  id: string
  type: 'mcq' | 'short_answer'
  question: string
  options?: string[]
  correctAnswer?: number
  studentAnswer?: number | string
  sampleAnswer?: string
  points: number
  maxPoints?: number
  isCorrect?: boolean | null
  autoGraded: boolean
}

interface QuizReviewerProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  grade?: { points: number; feedback: string }
  onGradeChange?: (points: number, feedback: string) => void
}

export default function QuizReviewer({
  question,
  questionNumber,
  totalQuestions,
  grade,
  onGradeChange
}: QuizReviewerProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Question {questionNumber} of {totalQuestions}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              {question.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
            </Badge>
            <Badge variant="outline">
              {question.points} points
            </Badge>
            {question.autoGraded && question.isCorrect !== null && (
              <Badge className={question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {question.isCorrect ? 'Correct' : 'Incorrect'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        </div>

        {/* MCQ Question */}
        {question.type === 'mcq' && question.options && (
          <div className="space-y-3">
            <h4 className="font-medium">Answer Options:</h4>
            {question.options.map((option, index) => (
              <div 
                key={index}
                className={`
                  p-3 rounded border
                  ${index === question.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
                  ${index === question.studentAnswer ? 'ring-2 ring-blue-300' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                  {index === question.correctAnswer && (
                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                  )}
                  {index === question.studentAnswer && index !== question.correctAnswer && (
                    <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Short Answer Question */}
        {question.type === 'short_answer' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Student's Answer:</h4>
              <div className="p-4 bg-gray-50 rounded border">
                {question.studentAnswer}
              </div>
            </div>

            {question.sampleAnswer && (
              <div>
                <h4 className="font-medium mb-2">Sample Answer:</h4>
                <div className="p-4 bg-blue-50 rounded border border-blue-200">
                  {question.sampleAnswer}
                </div>
              </div>
            )}

            {/* Grading */}
            {onGradeChange && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`points-${question.id}`}>Points Earned</Label>
                  <Input
                    id={`points-${question.id}`}
                    type="number"
                    min="0"
                    max={question.maxPoints || question.points}
                    value={grade?.points || ''}
                    onChange={(e) => onGradeChange(
                      parseInt(e.target.value) || 0,
                      grade?.feedback || ''
                    )}
                    placeholder={`0 - ${question.maxPoints || question.points}`}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Max: {question.maxPoints || question.points} points
                  </p>
                </div>

                <div>
                  <Label htmlFor={`feedback-${question.id}`}>Feedback for Student</Label>
                  <Textarea
                    id={`feedback-${question.id}`}
                    value={grade?.feedback || ''}
                    onChange={(e) => onGradeChange(
                      grade?.points || 0,
                      e.target.value
                    )}
                    placeholder="Provide specific feedback on the student's answer..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
