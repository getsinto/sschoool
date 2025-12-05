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
import { Sparkles, Edit, Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import { PlatformFeature } from '@/types/website-content'
import * as Icons from 'lucide-react'

export default function FeaturesManagementPage() {
  const [features, setFeatures] = useState<PlatformFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFeature, setEditingFeature] = useState<PlatformFeature | null>(null)
  const [formData, setFormData] = useState({
    icon_name: '',
    icon_url: '',
    icon_color: '#3B82F6',
    title: '',
    description: '',
    details: '',
    feature_image_url: '',
    category: 'platform' as 'teaching' | 'learning' | 'platform' | 'student_benefits' | 'parent_benefits',
    display_order: 0
  })

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/admin/website-content/features')
      const data = await response.json()
      setFeatures(data.features || [])
    } catch (error) {
      console.error('Error fetching features:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingFeature
        ? `/api/admin/website-content/features/${editingFeature.id}`
        : '/api/admin/website-content/features'
      
      const method = editingFeature ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchFeatures()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving feature:', error)
    }
  }

  const handleEdit = (feature: PlatformFeature) => {
    setEditingFeature(feature)
    setFormData({
      icon_name: feature.icon_name || '',
      icon_url: feature.icon_url || '',
      icon_color: feature.icon_color,
      title: feature.title,
      description: feature.description,
      details: feature.details || '',
      feature_image_url: feature.feature_image_url || '',
      category: feature.category,
      display_order: feature.display_order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return

    try {
      const response = await fetch(`/api/admin/website-content/features/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchFeatures()
      }
    } catch (error) {
      console.error('Error deleting feature:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      icon_name: '',
      icon_url: '',
      icon_color: '#3B82F6',
      title: '',
      description: '',
      details: '',
      feature_image_url: '',
      category: 'platform',
      display_order: 0
    })
    setEditingFeature(null)
    setShowForm(false)
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      teaching: 'Teaching',
      learning: 'Learning',
      platform: 'Platform',
      student_benefits: 'Student Benefits',
      parent_benefits: 'Parent Benefits'
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      teaching: 'bg-blue-100 text-blue-800',
      learning: 'bg-green-100 text-green-800',
      platform: 'bg-purple-100 text-purple-800',
      student_benefits: 'bg-orange-100 text-orange-800',
      parent_benefits: 'bg-pink-100 text-pink-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const renderIcon = (iconName?: string, iconColor?: string) => {
    if (!iconName) return <Sparkles className="w-6 h-6" style={{ color: iconColor }} />
    
    const IconComponent = (Icons as any)[iconName]
    if (!IconComponent) return <Sparkles className="w-6 h-6" style={{ color: iconColor }} />
    
    return <IconComponent className="w-6 h-6" style={{ color: iconColor }} />
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform Features Management</h1>
          <p className="text-gray-600">Manage platform features and benefits</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Feature</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingFeature ? 'Edit Feature' : 'Add New Feature'}</CardTitle>
            <CardDescription>
              Add a platform feature or benefit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

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
                      <SelectItem value="teaching">Teaching</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="platform">Platform</SelectItem>
                      <SelectItem value="student_benefits">Student Benefits</SelectItem>
                      <SelectItem value="parent_benefits">Parent Benefits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Details (optional)</Label>
                <Textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Icon Name (Lucide)</Label>
                  <Input
                    value={formData.icon_name}
                    onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                    placeholder="Video, BookOpen, Users"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon Color</Label>
                  <Input
                    type="color"
                    value={formData.icon_color}
                    onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
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

              <div className="space-y-2">
                <Label>Icon URL (alternative to icon name)</Label>
                <Input
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Feature Image URL</Label>
                <Input
                  value={formData.feature_image_url}
                  onChange={(e) => setFormData({ ...formData, feature_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingFeature ? 'Update' : 'Create'} Feature
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Card key={feature.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${feature.icon_color}20` }}>
                  {renderIcon(feature.icon_name, feature.icon_color)}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(feature)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(feature.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{feature.description}</p>

              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(feature.category)}>
                  {getCategoryLabel(feature.category)}
                </Badge>
                <Badge variant="outline">
                  Order: {feature.display_order}
                </Badge>
                {!feature.is_active && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {features.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No features yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first platform feature to get started
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Feature
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
