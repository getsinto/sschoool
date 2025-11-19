'use client'

import { useState, useEffect } from 'react'
import { Plus, MessageCircle, ThumbsUp, CheckCircle, User, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Question {
  id: string
  lessonId: string
  studentId: string
  studentName: string
  question: string
  createdAt: string
  status: 'open' | 'answered' | 'resolved'
  votes: number
  answers: Answer[]
}

interface Answer {
  id: string
  questionId: string
  authorId: string
  authorName: string
  authorRole: 'teacher' | 'student'
  answer: string
  createdAt: string
  votes: number
  isAccepted: boolean
}

interface QAPanelProps {
  lessonId: string
}

export default function QAPanel({ lessonId }: QAPanelProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'resolved'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    loadQuestions()
  }, [lessonId])

  const loadQuestions = async () => {
    try {
      const response = await fetch(`/api/student/qa?lessonId=${lessonId}`)
      const data = await response.json()
      if (data.success) {
        setQuestions(data.data)
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
    }
  }

  const askQuestion = async () => {
    if (!newQuestion.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/student/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          question: newQuestion
        })
      })

      const data = await response.json()
      if (data.success) {
        setQuestions([data.data, ...questions])
        setNewQuestion('')
      }
    } catch (error) {
      console.error('Failed to ask question:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitAnswer = async (questionId: string) => {
    if (!replyText.trim()) return

    try {
      const response = await fetch(`/api/student/qa/${questionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: replyText })
      })

      const data = await response.json()
      if (data.success) {
        setQuestions(questions.map(q => 
          q.id === questionId 
            ? { ...q, answers: [...q.answers, data.data] }
            : q
        ))
        setReplyingTo(null)
        setReplyText('')
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const voteOnAnswer = async (answerId: string, vote: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/student/qa/${answerId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote })
      })

      const data = await response.json()
      if (data.success) {
        setQuestions(questions.map(q => ({
          ...q,
          answers: q.answers.map(a => 
            a.id === answerId 
              ? { ...a, votes: data.data.newVoteCount }
              : a
          )
        })))
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
      answered: { label: 'Answered', color: 'bg-green-100 text-green-800' },
      resolved: { label: 'Resolved', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const filteredQuestions = questions.filter(q => 
    filter === 'all' || q.status === filter
  )

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Q&A Discussion</h3>
          <Badge variant="secondary">{questions.length} questions</Badge>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="open" className="flex-1">Open</TabsTrigger>
            <TabsTrigger value="answered" className="flex-1">Answered</TabsTrigger>
            <TabsTrigger value="resolved" className="flex-1">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Ask Question Form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Ask a question about this lesson..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={askQuestion} 
            disabled={!newQuestion.trim() || isSubmitting}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{question.studentName}</span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(question.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{question.question}</p>
                    </div>
                  </div>
                  {getStatusBadge(question.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Answers */}
                {question.answers.length > 0 && (
                  <div className="space-y-3 pl-4 border-l-2">
                    {question.answers.map((answer) => (
                      <div key={answer.id} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback>
                              {answer.authorRole === 'teacher' ? (
                                <GraduationCap className="w-4 h-4" />
                              ) : (
                                <User className="w-3 h-3" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{answer.authorName}</span>
                              {answer.authorRole === 'teacher' && (
                                <Badge variant="secondary" className="text-xs">Teacher</Badge>
                              )}
                              {answer.isAccepted && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(answer.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{answer.answer}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => voteOnAnswer(answer.id, 'up')}
                                className="h-7 px-2"
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {answer.votes}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === question.id ? (
                  <div className="space-y-2 pl-4">
                    <Textarea
                      placeholder="Write your answer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => submitAnswer(question.id)}
                        disabled={!replyText.trim()}
                      >
                        Submit Answer
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReplyingTo(question.id)}
                    className="w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Answer this question
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
