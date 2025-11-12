'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface FeedbackTemplate {
  id: string
  text: string
  category: string
}

interface QuickFeedbackProps {
  onInsert: (text: string) => void
}

const defaultTemplates: FeedbackTemplate[] = [
  { id: '1', text: 'Excellent work! Your analysis is thorough and well-structured.', category: 'positive' },
  { id: '2', text: 'Good effort, but please review the methodology section.', category: 'improvement' },
  { id: '3', text: 'Your conclusions need more supporting evidence from the data.', category: 'improvement' },
  { id: '4', text: 'Outstanding presentation and clarity!', category: 'positive' },
  { id: '5', text: 'Please cite your sources properly.', category: 'correction' },
  { id: '6', text: 'Consider expanding on this point with more examples.', category: 'suggestion' },
]

export default function QuickFeedback({ onInsert }: QuickFeedbackProps) {
  const [templates, setTemplates] = useState<FeedbackTemplate[]>(defaultTemplates)
  const [isAdding, setIsAdding] = useState(false)
  const [newTemplate, setNewTemplate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('positive')

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'improvement': return 'bg-yellow-100 text-yellow-800'
      case 'correction': return 'bg-red-100 text-red-800'
      case 'suggestion': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddTemplate = () => {
    if (newTemplate.trim()) {
      const template: FeedbackTemplate = {
        id: Date.now().toString(),
        text: newTemplate,
        category: selectedCategory
      }
      setTemplates([...templates, template])
      setNewTemplate('')
      setIsAdding(false)
    }
  }

  const handleRemoveTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Quick Feedback</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
            <Input
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              placeholder="Enter feedback template..."
              className="text-sm"
            />
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="positive">Positive</option>
                <option value="improvement">Improvement</option>
                <option value="correction">Correction</option>
                <option value="suggestion">Suggestion</option>
              </select>
              <Button size="sm" onClick={handleAddTemplate}>
                Add
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group flex items-start gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{template.text}</p>
                <Badge className={`${getCategoryColor(template.category)} mt-1`} variant="outline">
                  {template.category}
                </Badge>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onInsert(template.text)}
                  className="h-7 px-2"
                >
                  Insert
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTemplate(template.id)}
                  className="h-7 px-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No feedback templates yet</p>
            <p className="text-xs">Click + to add your first template</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
