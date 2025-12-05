'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { HelpCircle, Edit, Trash2, Plus, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { FAQ } from '@/types/website-content'

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general' as 'admissions' | 'courses' | 'payments' | 'technical' | 'general',
    display_order: 0
  })

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/admin/website-content/faq')
      const data = await response.json()
      setFaqs(data.faqs || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingFAQ
        ? `/api/admin/website-content/faq/${editingFAQ.id}`
        : '/api/admin/website-content/faq'
      
      const method = editingFAQ ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchFAQs()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      display_order: faq.display_order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      const response = await fetch(`/api/admin/website-content/faq/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchFAQs()
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      display_order: 0
    })
    setEditingFAQ(null)
    setShowForm(false)
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      admissions: 'Admissions',
      courses: 'Courses',
      payments: 'Payments',
      technical: 'Technical',
      general: 'General'
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      admissions: 'bg-blue-100 text-blue-800',
      courses: 'bg-green-100 text-green-800',
      payments: 'bg-purple-100 text-purple-800',
      technical: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const filteredFAQs = filterCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === filterCategory)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FAQ Management</h1>
          <p className="text-gray-600">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add FAQ</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</CardTitle>
            <CardDescription>
              Add a frequently asked question and answer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Question *</Label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Answer *</Label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admissions">Admissions</SelectItem>
                      <SelectItem value="courses">Courses</SelectItem>
                      <SelectItem value="payments">Payments</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingFAQ ? 'Update' : 'Create'} FAQ
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All FAQs</CardTitle>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="admissions">Admissions</SelectItem>
                <SelectItem value="courses">Courses</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h3 className="font-semibold flex-1">{faq.question}</h3>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {expandedFAQ === faq.id && (
                      <div className="mt-3 ml-8">
                        <p className="text-gray-700 mb-3">{faq.answer}</p>
                        <div className="flex gap-2">
                          <Badge className={getCategoryColor(faq.category)}>
                            {getCategoryLabel(faq.category)}
                          </Badge>
                          <Badge variant="outline">
                            Order: {faq.display_order}
                          </Badge>
                          <Badge variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            {faq.views_count} views
                          </Badge>
                          {!faq.is_active && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(faq)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(faq.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredFAQs.length === 0 && (
            <div className="p-12 text-center">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
              <p className="text-gray-600 mb-4">
                {filterCategory === 'all' 
                  ? 'Add your first FAQ to get started'
                  : `No FAQs in the ${getCategoryLabel(filterCategory)} category`
                }
              </p>
              {filterCategory === 'all' && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add FAQ
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
