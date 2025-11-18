'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  FileText,
  ClipboardCheck
} from 'lucide-react'

interface QueueItem {
  id: string
  type: 'quiz' | 'assignment'
  title: string
  student: {
    name: string
    avatar?: string
  }
  submittedAt: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  maxScore: number
}

interface GradingQueueProps {
  items: QueueItem[]
  onGrade: (id: string) => void
  currentItemId?: string
}

export default function GradingQueue({ items, onGrade, currentItemId }: GradingQueueProps) {
  const [filter, setFilter] = useState<'all' | 'quiz' | 'assignment'>('all')

  const filteredItems = items.filter(item => 
    filter === 'all' || item.type === filter
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'quiz' ? ClipboardCheck : FileText
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Grading Queue ({filteredItems.length})</h3>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'quiz' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('quiz')}
            >
              Quizzes
            </Button>
            <Button
              variant={filter === 'assignment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('assignment')}
            >
              Assignments
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => {
            const TypeIcon = getTypeIcon(item.type)
            const isActive = item.id === currentItemId

            return (
              <div
                key={item.id}
                className={`p-3 border rounded-lg transition-colors ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <TypeIcon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <Badge className={getPriorityColor(item.priority)} variant="outline">
                        {item.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={item.student.avatar} />
                        <AvatarFallback className="text-xs">
                          {item.student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{item.student.name}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(item.submittedAt)}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => onGrade(item.id)}
                    disabled={isActive}
                  >
                    {isActive ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No items in queue</p>
            <p className="text-xs">All caught up!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
