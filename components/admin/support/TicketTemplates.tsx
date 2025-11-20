'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Edit, Trash2, Copy } from 'lucide-react'

interface TicketTemplate {
  id: string
  name: string
  category: string
  priority: string
  subject: string
  description: string
  tags: string[]
  usage_count: number
}

interface TicketTemplatesProps {
  onSelectTemplate?: (template: TicketTemplate) => void
}

export function TicketTemplates({ onSelectTemplate }: TicketTemplatesProps) {
  const [templates, setTemplates] = useState<TicketTemplate[]>([
    {
      id: '1',
      name: 'Password Reset Request',
      category: 'account',
      priority: 'medium',
      subject: 'Unable to access account - Password reset needed',
      description: 'I am unable to log into my account and need assistance with resetting my password.\n\nAccount email: [USER_EMAIL]\nLast successful login: [DATE]\nError message: [ERROR_MESSAGE]',
      tags: ['password', 'login', 'access'],
      usage_count: 45
    },
    {
      id: '2',
      name: 'Course Access Issue',
      category: 'academic',
      priority: 'high',
      subject: 'Cannot access enrolled course',
      description: 'I have enrolled in a course but cannot access the content.\n\nCourse name: [COURSE_NAME]\nEnrollment date: [DATE]\nPayment confirmation: [PAYMENT_ID]\nError encountered: [ERROR_DESCRIPTION]',
      tags: ['course', 'access', 'enrollment'],
      usage_count: 32
    },
    {
      id: '3',
      name: 'Payment Inquiry',
      category: 'billing',
      priority: 'medium',
      subject: 'Question about recent charge',
      description: 'I have a question regarding a recent charge on my account.\n\nTransaction date: [DATE]\nAmount: [AMOUNT]\nTransaction ID: [TRANSACTION_ID]\nQuestion: [QUESTION_DETAILS]',
      tags: ['payment', 'billing', 'charge'],
      usage_count: 28
    },
    {
      id: '4',
      name: 'Technical Error Report',
      category: 'technical',
      priority: 'high',
      subject: 'Technical error encountered',
      description: 'I encountered a technical error while using the platform.\n\nPage/Feature: [PAGE_NAME]\nBrowser: [BROWSER]\nDevice: [DEVICE]\nError message: [ERROR_MESSAGE]\nSteps to reproduce:\n1. [STEP_1]\n2. [STEP_2]\n3. [STEP_3]',
      tags: ['bug', 'error', 'technical'],
      usage_count: 21
    }
  ])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    priority: 'medium',
    subject: '',
    description: '',
    tags: ''
  })

  const categories = ['general', 'technical', 'billing', 'account', 'academic']
  const priorities = ['low', 'medium', 'high', 'urgent']

  const handleSave = () => {
    if (editingId) {
      setTemplates(prev => prev.map(t =>
        t.id === editingId ? {
          ...t,
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        } : t
      ))
    } else {
      const newTemplate: TicketTemplate = {
        id: Date.now().toString(),
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        usage_count: 0
      }
      setTemplates(prev => [...prev, newTemplate])
    }
    
    setFormData({ name: '', category: 'general', priority: 'medium', subject: '', description: '', tags: '' })
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleEdit = (template: TicketTemplate) => {
    setFormData({
      name: template.name,
      category: template.category,
      priority: template.priority,
      subject: template.subject,
      description: template.description,
      tags: template.tags.join(', ')
    })
    setEditingId(template.id)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleUseTemplate = (template: TicketTemplate) => {
    setTemplates(prev => prev.map(t =>
      t.id === template.id ? { ...t, usage_count: t.usage_count + 1 } : t
    ))
    onSelectTemplate?.(template)
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
            <FileText className="h-5 w-5" />
            Ticket Templates
          </CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingId(null)
              setFormData({ name: '', category: 'general', priority: 'medium', subject: '', description: '', tags: '' })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Template'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50 space-y-3">
            <Input
              placeholder="Template name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                {priorities.map(pri => (
                  <option key={pri} value={pri}>
                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Subject template"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            <Textarea
              placeholder="Description template (use [PLACEHOLDER] for variables)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
            />
            <Input
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <Button onClick={handleSave} className="w-full">
              {editingId ? 'Update Template' : 'Save Template'}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {templates.map(template => (
            <div
              key={template.id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Used {template.usage_count} times
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {onSelectTemplate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseTemplate(template)}
                  className="w-full"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Use This Template
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Use placeholders like [USER_EMAIL], [DATE], [COURSE_NAME] in templates. Users can fill them in when creating tickets.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
