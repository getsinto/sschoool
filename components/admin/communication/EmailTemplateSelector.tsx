'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Eye, Edit, Trash2, Plus } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  category: string
  preview: string
  variables: string[]
  lastUsed?: string
}

interface EmailTemplateSelectorProps {
  onSelect: (template: EmailTemplate) => void
  selectedId?: string
}

export default function EmailTemplateSelector({ onSelect, selectedId }: EmailTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const templates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to platform!',
      category: 'Onboarding',
      preview: 'Welcome! We are excited to have you join our learning platform',
      variables: ['student_name', 'platform_name', 'login_url'],
      lastUsed: '2024-01-15'
    },
    {
      id: '2',
      name: 'Course Enrollment Confirmation',
      subject: 'You are enrolled in course',
      category: 'Enrollment',
      preview: 'Congratulations! You have successfully enrolled in the course',
      variables: ['student_name', 'course_name', 'course_url', 'start_date'],
      lastUsed: '2024-01-14'
    },
    {
      id: '3',
      name: 'Payment Receipt',
      subject: 'Payment Receipt',
      category: 'Payment',
      preview: 'Thank you for your payment. Your transaction has been completed',
      variables: ['student_name', 'amount', 'invoice_number', 'date', 'course_name'],
      lastUsed: '2024-01-13'
    },
    {
      id: '4',
      name: 'Class Reminder',
      subject: 'Reminder: Class starts in 1 hour',
      category: 'Classes',
      preview: 'Hi, this is a reminder that your class starts soon',
      variables: ['student_name', 'class_name', 'time', 'join_url'],
      lastUsed: '2024-01-12'
    },
    {
      id: '5',
      name: 'Certificate Awarded',
      subject: 'Congratulations! You earned a certificate',
      category: 'Achievement',
      preview: 'Congratulations! You have successfully completed the course',
      variables: ['student_name', 'course_name', 'certificate_url', 'completion_date']
    }
  ]

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Email Templates</h3>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedId === template.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelect(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{template.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-medium">Subject:</span> {template.subject}
              </p>
              
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                {template.preview}
              </p>

              <div className="flex flex-wrap gap-1 mb-2">
                {template.variables.map((variable) => (
                  <Badge key={variable} variant="secondary" className="text-xs">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>

              {template.lastUsed && (
                <p className="text-xs text-gray-400">
                  Last used: {new Date(template.lastUsed).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No templates found</p>
        </div>
      )}
    </div>
  )
}
