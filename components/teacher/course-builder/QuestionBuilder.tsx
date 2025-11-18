'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, X, GripVertical, Image as ImageIcon } from 'lucide-react'

interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  type: 'mcq' | 'true-false' | 'short-answer' | 'multiple-response'
  text: string
  image?: string
  options?: QuestionOption[]
  correctAnswers: number[] | string[]
  points: number
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuestionBuilderProps {
  open: boolean
  onClose: () => void
  onSave: (question: Question) => void
  question?: Question | null
}

export function QuestionBuilder({ open, onClose, onSave, question }: QuestionBuilderProps) {
  const [questionData, setQuestionData] = useState<Question>({
    id: question?.id || `question-${Date.now()}`,
    type: question?.type || 'mcq',
    text: question?.text || '',
    image: question?.image || '',
    options: question?.options || [
      { id: 'opt-1', text: '', isCorrect: false },
      { id: 'opt-2', text: '', isCorrect: false }
    ],
    correctAnswers: question?.correctAnswers || [],
    points: question?.points || 1,
    explanation: question?.explanation || '',
    difficulty: question?.difficulty || 'medium'
  })

  const updateField = (field: keyof Question, value: any) => {
    setQuestionData({ ...questionData, [field]: value })
  }

  const addOption = () => {
    if (!questionData.options) return
    const newOption: QuestionOption = {
      id: `opt-${Date.now()}`,
      text: '',
      isCorrect: false
    }
    updateField('options', [...questionData.options, newOption])
  }

  const removeOption = (optionId: string) => {
    if (!questionData.options || questionData.options.length <= 2) return
    updateField('options', questionData.options.filter(opt => opt.id !== optionId))
  }

  const updateOption = (optionId: string, field: keyof QuestionOption, value: any) => {
    if (!questionData.options) return
    const updated = questionData.options.map(opt => 
      opt.id === optionId ? { ...opt, [field]: value } : opt
    )
    updateField('options', updated)
  }

  const toggleCorrectAnswer = (optionIndex: number) => {
    if (!questionData.options) return
    
    if (questionData.type === 'mcq' || questionData.type === 'true-false') {
      const updated = questionData.options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === optionIndex
      }))
      updateField('options', updated)
      updateField('correctAnswers', [optionIndex])
    } else if (questionData.type === 'multiple-response') {
      const updated = questionData.options.map((opt, idx) => 
        idx === optionIndex ? { ...opt, isCorrect: !opt.isCorrect } : opt
      )
      updateField('options', updated)
      const correctIndices = updated
        .map((opt, idx) => opt.isCorrect ? idx : -1)
        .filter(idx => idx !== -1)
      updateField('correctAnswers', correctIndices)
    }
  }

  const handleSave = () => {
    if (!questionData.text.trim()) {
      alert('Question text is required')
      return
    }
    
    if (questionData.type !== 'short-answer') {
      if (!questionData.options || questionData.options.length < 2) {
        alert('At least 2 options are required')
        return
      }
      if (!questionData.options.some(opt => opt.isCorrect)) {
        alert('At least one correct answer must be selected')
        return
      }
    }

    onSave(questionData)
    onClose()
  }

  const renderQuestionTypeContent = () => {
    switch (questionData.type) {
      case 'mcq':
      case 'multiple-response':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={questionData.options && questionData.options.length >= 10}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>
            {questionData.options?.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                <div className="flex items-center">
                  <input
                    type={questionData.type === 'mcq' ? 'radio' : 'checkbox'}
                    name="correct-answer"
                    checked={option.isCorrect}
                    onChange={() => toggleCorrectAnswer(index)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="flex-1"
                />
                {questionData.options && questionData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-xs text-gray-500">
              {questionData.type === 'mcq' 
                ? 'Select one correct answer' 
                : 'Select multiple correct answers'}
            </p>
          </div>
        )
      
      case 'true-false':
        return (
          <div className="space-y-3">
            <Label>Correct Answer</Label>
            <RadioGroup
              value={questionData.correctAnswers[0]?.toString() || '0'}
              onValueChange={(value) => {
                const isTrue = value === '1'
                updateField('options', [
                  { id: 'true', text: 'True', isCorrect: isTrue },
                  { id: 'false', text: 'False', isCorrect: !isTrue }
                ])
                updateField('correctAnswers', [parseInt(value)])
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="true" />
                <Label htmlFor="true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="false" />
                <Label htmlFor="false">False</Label>
              </div>
            </RadioGroup>
          </div>
        )
      
      case 'short-answer':
        return (
          <div className="space-y-3">
            <div>
              <Label>Sample Answer(s)</Label>
              <Textarea
                value={Array.isArray(questionData.correctAnswers) 
                  ? questionData.correctAnswers.join('\n') 
                  : questionData.correctAnswers}
                onChange={(e) => updateField('correctAnswers', e.target.value.split('\n'))}
                placeholder="Enter sample answers (one per line)"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide sample answers for reference during grading
              </p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? 'Edit Question' : 'Create Question'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Question Type</Label>
            <Select
              value={questionData.type}
              onValueChange={(value: any) => {
                updateField('type', value)
                if (value === 'true-false') {
                  updateField('options', [
                    { id: 'true', text: 'True', isCorrect: false },
                    { id: 'false', text: 'False', isCorrect: false }
                  ])
                } else if (value === 'short-answer') {
                  updateField('options', undefined)
                  updateField('correctAnswers', [])
                } else {
                  updateField('options', [
                    { id: 'opt-1', text: '', isCorrect: false },
                    { id: 'opt-2', text: '', isCorrect: false }
                  ])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice (Single Answer)</SelectItem>
                <SelectItem value="multiple-response">Multiple Response (Multiple Answers)</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Question Text *</Label>
            <Textarea
              value={questionData.text}
              onChange={(e) => updateField('text', e.target.value)}
              placeholder="Enter your question here..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Question Image (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload image</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </div>

          {renderQuestionTypeContent()}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Points *</Label>
              <Input
                type="number"
                value={questionData.points}
                onChange={(e) => updateField('points', parseInt(e.target.value) || 1)}
                min="1"
                required
              />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select
                value={questionData.difficulty}
                onValueChange={(value: any) => updateField('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    <Badge className="bg-green-100 text-green-800">Easy</Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                  </SelectItem>
                  <SelectItem value="hard">
                    <Badge className="bg-red-100 text-red-800">Hard</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Explanation (Optional)</Label>
            <Textarea
              value={questionData.explanation}
              onChange={(e) => updateField('explanation', e.target.value)}
              placeholder="Explain why this is the correct answer..."
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Shown to students after they answer
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
