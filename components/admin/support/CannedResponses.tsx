'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus, Edit, Trash2, Search } from 'lucide-react'

interface CannedResponse {
  id: string
  title: string
  content: string
  category: string
  usage_count: number
}

interface CannedResponsesProps {
  onSelect?: (content: string) => void
}

export function CannedResponses({ onSelect }: CannedResponsesProps) {
  const [responses, setResponses] = useState<CannedResponse[]>([
    {
      id: '1',
      title: 'Welcome Message',
      content: 'Thank you for contacting support. We have received your request and will respond within 24 hours.',
      category: 'general',
      usage_count: 45
    },
    {
      id: '2',
      title: 'Account Issue - Password Reset',
      content: 'I understand you\'re having trouble with your password. I\'ve sent you a password reset link to your registered email address. Please check your inbox and spam folder.',
      category: 'account',
      usage_count: 32
    },
    {
      id: '3',
      title: 'Technical Issue - Investigating',
      content: 'Thank you for reporting this technical issue. Our team is currently investigating and we\'ll update you as soon as we have more information.',
      category: 'technical',
      usage_count: 28
    },
    {
      id: '4',
      title: 'Billing Question',
      content: 'Regarding your billing inquiry, I\'ve reviewed your account and can provide the following information...',
      category: 'billing',
      usage_count: 21
    },
    {
      id: '5',
      title: 'Issue Resolved',
      content: 'I\'m glad we could resolve your issue. If you have any other questions or concerns, please don\'t hesitate to reach out.',
      category: 'general',
      usage_count: 67
    }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  })

  const categories = ['general', 'technical', 'billing', 'account', 'academic']

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || response.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelect = (content: string, id: string) => {
    // Update usage count
    setResponses(prev => prev.map(r => 
      r.id === id ? { ...r, usage_count: r.usage_count + 1 } : r
    ))
    onSelect?.(content)
  }

  const handleSave = () => {
    if (editingId) {
      setResponses(prev => prev.map(r =>
        r.id === editingId ? { ...r, ...formData } : r
      ))
    } else {
      const newResponse: CannedResponse = {
        id: Date.now().toString(),
        ...formData,
        usage_count: 0
      }
      setResponses(prev => [...prev, newResponse])
    }
    
    setFormData({ title: '', content: '', category: 'general' })
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleEdit = (response: CannedResponse) => {
    setFormData({
      title: response.title,
      content: response.content,
      category: response.category
    })
    setEditingId(response.id)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this canned response?')) {
      setResponses(prev => prev.filter(r => r.id !== id))
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      technical: 'bg-blue-100 text-blue-800',
      billing: 'bg-green-100 text-green-800',
      account: 'bg-purple-100 text-purple-800',
      academic: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || colors.general
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Canned Responses
          </CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingId(null)
              setFormData({ title: '', content: '', category: 'general' })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add New'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50 space-y-3">
            <Input
              placeholder="Response title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Response content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
            />
            <div className="flex gap-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <Button onClick={handleSave}>
                {editingId ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredResponses.map(response => (
            <div
              key={response.id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{response.title}</h4>
                    <Badge className={getCategoryColor(response.category)}>
                      {response.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {response.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Used {response.usage_count} times
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(response)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(response.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {onSelect && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelect(response.content, response.id)}
                  className="w-full"
                >
                  Use This Response
                </Button>
              )}
            </div>
          ))}

          {filteredResponses.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No responses found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
