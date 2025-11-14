'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  usageCount: number
  status: 'active' | 'inactive'
}

interface FAQManagerProps {
  faqs: FAQ[]
  onAdd: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (faqs: FAQ[]) => void
}

export default function FAQManager({ faqs, onAdd, onEdit, onDelete, onReorder }: FAQManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', ...Array.from(new Set(faqs.map(f => f.category)))]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">FAQ Management</h3>
        <Button onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-2">
        <Input
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* FAQ List */}
      <div className="space-y-2">
        {filteredFAQs.map((faq) => (
          <Card key={faq.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{faq.category}</Badge>
                    <Badge className={faq.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {faq.status}
                    </Badge>
                    <span className="text-xs text-gray-500">Used {faq.usageCount} times</span>
                  </div>
                  <h4 className="font-medium mb-1">{faq.question}</h4>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(faq.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(faq.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFAQs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No FAQs found</p>
        </div>
      )}
    </div>
  )
}
