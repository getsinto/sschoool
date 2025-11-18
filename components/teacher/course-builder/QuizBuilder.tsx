'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, GripVertical, Edit, Trash2, Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Question {
  id: string
  type: 'mcq' | 'true-false' | 'short-answer' | 'multiple-response'
  text: string
  image?: string
  options?: string[]
  correctAnswers: number[] | string[]
  points: number
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuizBuilderProps {
  value?: any
  onChange: (quiz: any) => void
}

export function QuizBuilder({ value, onChange }: QuizBuilderProps) {
  const [quizData, setQuizData] = useState({
    title: value?.title || '',
    instructions: value?.instructions || '',
    timeLimit: value?.timeLimit || 0,
    passingScore: value?.passingScore || 70,
    maxAttempts: value?.maxAttempts || 0, // 0 = unlimited
    shuffleQuestions: value?.shuffleQuestions || false,
    shuffleAnswers: value?.shuffleAnswers || false,
    showCorrectAnswers: value?.showCorrectAnswers || 'after-completion', // 'immediate', 'after-completion', 'never'
    allowReview: value?.allowReview || true,
    questions: value?.questions || [] as Question[]
  })

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showQuestionModal, setShowQuestionModal] = useState(false)

  const updateQuizSettings = (field: string, value: any) => {
    const updated = { ...quizData, [field]: value }
    setQuizData(updated)
    onChange(updated)
  }

  const addQuestion = (question: Question) => {
    const updated = {
      ...quizData,
      questions: [...quizData.questions, question]
    }
    setQuizData(updated)
    onChange(updated)
  }

  const updateQuestion = (id: string, question: Question) => {
    const updated = {
      ...quizData,
      questions: quizData.questions.map((q: Question) => q.id === id ? question : q)
    }
    setQuizData(updated)
    onChange(updated)
  }

  const deleteQuestion = (id: string) => {
    const updated = {
      ...quizData,
      questions: quizData.questions.filter((q: Question) => q.id !== id)
    }
    setQuizData(updated)
    onChange(updated)
  }

  const duplicateQuestion = (question: Question) => {
    const duplicate = {
      ...question,
      id: `question-${Date.now()}`,
      text: `${question.text} (Copy)`
    }
    addQuestion(duplicate)
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= quizData.questions.length) return

    const questions = [...quizData.questions]
    const temp = questions[index]
    questions[index] = questions[newIndex]
    questions[newIndex] = temp

    const updated = { ...quizData, questions }
    setQuizData(updated)
    onChange(updated)
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq': return 'Multiple Choice'
      case 'true-false': return 'True/False'
      case 'short-answer': return 'Short Answer'
      case 'multiple-response': return 'Multiple Response'
      default: return type
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>
              Quiz Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={quizData.title}
              onChange={(e) => updateQuizSettings('title', e.target.value)}
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div>
            <Label>Instructions</Label>
            <Textarea
              value={quizData.instructions}
              onChange={(e) => updateQuizSettings('instructions', e.target.value)}
              placeholder="Provide instructions for students"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Time Limit (minutes)</Label>
              <Input
                type="number"
                value={quizData.timeLimit}
                onChange={(e) => updateQuizSettings('timeLimit', parseInt(e.target.value) || 0)}
                placeholder="0 = No limit"
                min="0"
              />
            </div>

            <div>
              <Label>
                Passing Score (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={quizData.passingScore}
                onChange={(e) => updateQuizSettings('passingScore', parseInt(e.target.value) || 70)}
                placeholder="70"
                min="0"
                max="100"
                required
              />
            </div>
          </div>

          <div>
            <Label>Max Attempts</Label>
            <Input
              type="number"
              value={quizData.maxAttempts}
              onChange={(e) => updateQuizSettings('maxAttempts', parseInt(e.target.value) || 0)}
              placeholder="0 = Unlimited"
              min="0"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Shuffle Questions</Label>
                <p className="text-sm text-gray-500">Randomize question order</p>
              </div>
              <Switch
                checked={quizData.shuffleQuestions}
                onCheckedChange={(checked) => updateQuizSettings('shuffleQuestions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Shuffle Answers</Label>
                <p className="text-sm text-gray-500">Randomize answer options</p>
              </div>
              <Switch
                checked={quizData.shuffleAnswers}
                onCheckedChange={(checked) => updateQuizSettings('shuffleAnswers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Review</Label>
                <p className="text-sm text-gray-500">Let students review answers</p>
              </div>
              <Switch
                checked={quizData.allowReview}
                onCheckedChange={(checked) => updateQuizSettings('allowReview', checked)}
              />
            </div>
          </div>

          <div>
            <Label>Show Correct Answers</Label>
            <Select
              value={quizData.showCorrectAnswers}
              onValueChange={(value) => updateQuizSettings('showCorrectAnswers', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediately</SelectItem>
                <SelectItem value="after-completion">After Completion</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions ({quizData.questions.length})</CardTitle>
            <Button onClick={() => {
              setEditingQuestion(null)
              setShowQuestionModal(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quizData.questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No questions added yet</p>
              <p className="text-sm mt-1">Click "Add Question" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizData.questions.map((question: Question, index: number) => (
                <div
                  key={question.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg group"
                >
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move mt-1" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-700">Q{index + 1}.</span>
                          <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <span className="text-sm text-gray-500">{question.points} pts</span>
                        </div>
                        <p className="text-sm text-gray-900">{question.text}</p>
                      </div>
                    </div>

                    {question.options && question.options.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2 text-sm">
                            <span className={`
                              w-5 h-5 rounded-full flex items-center justify-center text-xs
                              ${question.correctAnswers.includes(optIndex) 
                                ? 'bg-green-100 text-green-700 font-semibold' 
                                : 'bg-gray-200 text-gray-600'}
                            `}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className={question.correctAnswers.includes(optIndex) ? 'font-medium' : ''}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(index, 'up')}
                        title="Move up"
                      >
                        ↑
                      </Button>
                    )}
                    
                    {index < quizData.questions.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(index, 'down')}
                        title="Move down"
                      >
                        ↓
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingQuestion(question)
                        setShowQuestionModal(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateQuestion(question)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Modal would go here - simplified for now */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Question builder interface would go here
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowQuestionModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
