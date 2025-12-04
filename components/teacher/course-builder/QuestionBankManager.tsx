'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Plus, Edit, Trash2, Copy, Filter, Download, Upload, Shuffle } from 'lucide-react'

export interface QuestionBankQuestion {
  id: string
  type: 'mcq' | 'true-false' | 'short-answer' | 'multiple-response' | 'essay' | 'matching'
  text: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  options?: string[]
  correctAnswers: number[] | string[]
  explanation?: string
  tags: string[]
  usageCount: number
  lastUsed?: string
}

interface QuestionBankManagerProps {
  questions: QuestionBankQuestion[]
  onQuestionsChange: (questions: QuestionBankQuestion[]) => void
  onSelectQuestions?: (questions: QuestionBankQuestion[]) => void
  mode?: 'manage' | 'select'
}

export function QuestionBankManager({
  questions = [],
  onQuestionsChange,
  onSelectQuestions,
  mode = 'manage'
}: QuestionBankManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [showRandomSelector, setShowRandomSelector] = useState(false)

  // Get unique categories and tags
  const categories = Array.from(new Set(questions.map(q => q.category).filter(Boolean)))
  const allTags = Array.from(new Set(questions.flatMap(q => q.tags)))

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!q.text.toLowerCase().includes(query) &&
          !q.tags.some(tag => tag.toLowerCase().includes(query))) {
        return false
      }
    }
    if (categoryFilter !== 'all' && q.category !== categoryFilter) return false
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false
    if (typeFilter !== 'all' && q.type !== typeFilter) return false
    return true
  })

  // Statistics
  const stats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
    byType: {
      mcq: questions.filter(q => q.type === 'mcq').length,
      trueFalse: questions.filter(q => q.type === 'true-false').length,
      shortAnswer: questions.filter(q => q.type === 'short-answer').length,
      multipleResponse: questions.filter(q => q.type === 'multiple-response').length,
      essay: questions.filter(q => q.type === 'essay').length,
      matching: questions.filter(q => q.type === 'matching').length
    }
  }

  const toggleQuestionSelection = (id: string) => {
    const newSelection = new Set(selectedQuestions)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedQuestions(newSelection)
  }

  const selectAll = () => {
    setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)))
  }

  const deselectAll = () => {
    setSelectedQuestions(new Set())
  }

  const handleSelectQuestions = () => {
    const selected = questions.filter(q => selectedQuestions.has(q.id))
    onSelectQuestions?.(selected)
  }

  const handleRandomSelect = (count: number, criteria: any) => {
    let pool = [...questions]
    
    // Apply criteria filters
    if (criteria.category !== 'all') {
      pool = pool.filter(q => q.category === criteria.category)
    }
    if (criteria.difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === criteria.difficulty)
    }
    if (criteria.type !== 'all') {
      pool = pool.filter(q => q.type === criteria.type)
    }

    // Shuffle and select
    const shuffled = pool.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))
    
    setSelectedQuestions(new Set(selected.map(q => q.id)))
    setShowRandomSelector(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'mcq': 'Multiple Choice',
      'true-false': 'True/False',
      'short-answer': 'Short Answer',
      'multiple-response': 'Multiple Response',
      'essay': 'Essay',
      'matching': 'Matching'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Question Bank</h3>
          <p className="text-sm text-gray-600">
            {mode === 'select' ? 'Select questions for your quiz' : 'Manage your question library'}
          </p>
        </div>
        <div className="flex gap-2">
          {mode === 'select' && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRandomSelector(true)}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Random Select
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSelectQuestions}
                disabled={selectedQuestions.size === 0}
              >
                Add Selected ({selectedQuestions.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Easy</p>
              <p className="text-2xl font-bold text-green-600">{stats.easy}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Hard</p>
              <p className="text-2xl font-bold text-red-600">{stats.hard}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="multiple-response">Multiple Response</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="matching">Matching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'select' && filteredQuestions.length > 0 && (
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAll}
              >
                Select All ({filteredQuestions.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={deselectAll}
                disabled={selectedQuestions.size === 0}
              >
                Deselect All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No questions found</p>
            {(searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all' || typeFilter !== 'all') && (
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredQuestions.map((question) => (
            <Card key={question.id} className={selectedQuestions.has(question.id) ? 'border-blue-500 bg-blue-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {mode === 'select' && (
                    <Checkbox
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={() => toggleQuestionSelection(question.id)}
                      className="mt-1"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{question.text}</p>
                        {question.category && (
                          <p className="text-sm text-gray-600 mt-1">Category: {question.category}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">{question.points} pts</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(question.type)}
                      </Badge>
                      {question.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {question.usageCount > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          Used {question.usageCount} times
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Random Selector Modal */}
      {showRandomSelector && (
        <RandomSelectorModal
          categories={categories}
          onSelect={handleRandomSelect}
          onClose={() => setShowRandomSelector(false)}
          maxQuestions={questions.length}
        />
      )}
    </div>
  )
}

// Random Selector Modal
function RandomSelectorModal({
  categories,
  onSelect,
  onClose,
  maxQuestions
}: {
  categories: string[]
  onSelect: (count: number, criteria: any) => void
  onClose: () => void
  maxQuestions: number
}) {
  const [count, setCount] = useState(10)
  const [criteria, setCriteria] = useState({
    category: 'all',
    difficulty: 'all',
    type: 'all'
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Random Question Selection</DialogTitle>
          <DialogDescription>
            Select random questions based on your criteria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="count">Number of Questions</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max={maxQuestions}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {maxQuestions} questions available
            </p>
          </div>

          <div>
            <Label htmlFor="category">Category (Optional)</Label>
            <Select
              value={criteria.category}
              onValueChange={(value) => setCriteria({ ...criteria, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty (Optional)</Label>
            <Select
              value={criteria.difficulty}
              onValueChange={(value) => setCriteria({ ...criteria, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Question Type (Optional)</Label>
            <Select
              value={criteria.type}
              onValueChange={(value) => setCriteria({ ...criteria, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="multiple-response">Multiple Response</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="matching">Matching</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onSelect(count, criteria)}>
            <Shuffle className="h-4 w-4 mr-2" />
            Select Random
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
