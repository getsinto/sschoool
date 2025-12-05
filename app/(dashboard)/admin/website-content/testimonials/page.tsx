'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Star, Edit, Trash2, Plus, Video, User, Award } from 'lucide-react'
import { Testimonial } from '@/types/website-content'

export default function TestimonialsManagementPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    person_name: '',
    person_type: 'parent' as 'parent' | 'student',
    person_photo_url: '',
    rating: 5,
    testimonial_text: '',
    student_name: '',
    student_grade: '',
    course_program: '',
    video_url: '',
    is_featured: false,
    display_order: 0
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/admin/website-content/testimonials')
      const data = await response.json()
      setTestimonials(data.testimonials || [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingTestimonial
        ? `/api/admin/website-content/testimonials/${editingTestimonial.id}`
        : '/api/admin/website-content/testimonials'
      
      const method = editingTestimonial ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchTestimonials()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving testimonial:', error)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      person_name: testimonial.person_name,
      person_type: testimonial.person_type,
      person_photo_url: testimonial.person_photo_url || '',
      rating: testimonial.rating || 5,
      testimonial_text: testimonial.testimonial_text,
      student_name: testimonial.student_name || '',
      student_grade: testimonial.student_grade || '',
      course_program: testimonial.course_program || '',
      video_url: testimonial.video_url || '',
      is_featured: testimonial.is_featured,
      display_order: testimonial.display_order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const response = await fetch(`/api/admin/website-content/testimonials/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTestimonials()
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      person_name: '',
      person_type: 'parent',
      person_photo_url: '',
      rating: 5,
      testimonial_text: '',
      student_name: '',
      student_grade: '',
      course_program: '',
      video_url: '',
      is_featured: false,
      display_order: 0
    })
    setEditingTestimonial(null)
    setShowForm(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Testimonials Management</h1>
          <p className="text-gray-600">Manage parent and student testimonials</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Testimonial</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</CardTitle>
            <CardDescription>
              Add a testimonial from a parent or student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Person Name *</Label>
                  <Input
                    value={formData.person_name}
                    onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Person Type *</Label>
                  <Select
                    value={formData.person_type}
                    onValueChange={(value: any) => setFormData({ ...formData, person_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Person Photo URL</Label>
                <Input
                  value={formData.person_photo_url}
                  onChange={(e) => setFormData({ ...formData, person_photo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Rating (1-5)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-24"
                  />
                  <div className="flex gap-1">
                    {renderStars(formData.rating)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Testimonial Text *</Label>
                <Textarea
                  value={formData.testimonial_text}
                  onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <Input
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Student Grade</Label>
                  <Input
                    value={formData.student_grade}
                    onChange={(e) => setFormData({ ...formData, student_grade: e.target.value })}
                    placeholder="Grade 5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Course/Program</Label>
                  <Input
                    value={formData.course_program}
                    onChange={(e) => setFormData({ ...formData, course_program: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Video URL (optional)</Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Featured Testimonial</Label>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
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
                  {editingTestimonial ? 'Update' : 'Create'} Testimonial
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {testimonial.person_photo_url ? (
                      <img src={testimonial.person_photo_url} alt={testimonial.person_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{testimonial.person_name}</h3>
                      <Badge variant={testimonial.person_type === 'parent' ? 'default' : 'secondary'}>
                        {testimonial.person_type}
                      </Badge>
                      {testimonial.is_featured && (
                        <Badge variant="default" className="bg-yellow-500">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {testimonial.status === 'inactive' && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    
                    {testimonial.rating && (
                      <div className="flex gap-1 mb-2">
                        {renderStars(testimonial.rating)}
                      </div>
                    )}

                    <p className="text-gray-700 mb-3 italic">"{testimonial.testimonial_text}"</p>

                    <div className="flex gap-4 text-sm text-gray-600">
                      {testimonial.student_name && (
                        <span>Student: {testimonial.student_name}</span>
                      )}
                      {testimonial.student_grade && (
                        <span>{testimonial.student_grade}</span>
                      )}
                      {testimonial.course_program && (
                        <span>Program: {testimonial.course_program}</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2">
                      {testimonial.video_url && (
                        <Badge variant="outline">
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </Badge>
                      )}
                      <Badge variant="outline">
                        Order: {testimonial.display_order}
                      </Badge>
                      <Badge variant="outline">
                        Views: {testimonial.views_count}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(testimonial)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {testimonials.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No testimonials yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first testimonial to get started
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Testimonial
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
