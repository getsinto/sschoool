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
import { FileText, Download, Upload, Edit, Trash2, Plus, Eye } from 'lucide-react'
import { Brochure } from '@/types/website-content'

export default function BrochureManagementPage() {
  const [brochures, setBrochures] = useState<Brochure[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBrochure, setEditingBrochure] = useState<Brochure | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_size: 0,
    total_pages: 0,
    version: '',
    brochure_type: 'general' as 'online_school' | 'spoken_english' | 'tuition' | 'general',
    is_current: false,
    allow_download: true,
    require_email: false
  })

  useEffect(() => {
    fetchBrochures()
  }, [])

  const fetchBrochures = async () => {
    try {
      const response = await fetch('/api/admin/website-content/brochure')
      const data = await response.json()
      setBrochures(data.brochures || [])
    } catch (error) {
      console.error('Error fetching brochures:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingBrochure
        ? `/api/admin/website-content/brochure/${editingBrochure.id}`
        : '/api/admin/website-content/brochure'
      
      const method = editingBrochure ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchBrochures()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving brochure:', error)
    }
  }

  const handleEdit = (brochure: Brochure) => {
    setEditingBrochure(brochure)
    setFormData({
      title: brochure.title,
      description: brochure.description || '',
      file_url: brochure.file_url,
      file_size: brochure.file_size || 0,
      total_pages: brochure.total_pages || 0,
      version: brochure.version || '',
      brochure_type: brochure.brochure_type,
      is_current: brochure.is_current,
      allow_download: brochure.allow_download,
      require_email: brochure.require_email
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brochure?')) return

    try {
      const response = await fetch(`/api/admin/website-content/brochure/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchBrochures()
      }
    } catch (error) {
      console.error('Error deleting brochure:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      file_url: '',
      file_size: 0,
      total_pages: 0,
      version: '',
      brochure_type: 'general',
      is_current: false,
      allow_download: true,
      require_email: false
    })
    setEditingBrochure(null)
    setShowForm(false)
  }

  const getBrochureTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      online_school: 'Online School',
      spoken_english: 'Spoken English',
      tuition: 'Tuition',
      general: 'General'
    }
    return labels[type] || type
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brochure Management</h1>
          <p className="text-gray-600">Manage downloadable brochures for your website</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Brochure</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBrochure ? 'Edit Brochure' : 'Add New Brochure'}</CardTitle>
            <CardDescription>
              Upload and configure a brochure for download
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
                  <Label>Brochure Type *</Label>
                  <Select
                    value={formData.brochure_type}
                    onValueChange={(value: any) => setFormData({ ...formData, brochure_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online_school">Online School</SelectItem>
                      <SelectItem value="spoken_english">Spoken English</SelectItem>
                      <SelectItem value="tuition">Tuition</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>File URL *</Label>
                <Input
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>File Size (bytes)</Label>
                  <Input
                    type="number"
                    value={formData.file_size}
                    onChange={(e) => setFormData({ ...formData, file_size: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Pages</Label>
                  <Input
                    type="number"
                    value={formData.total_pages}
                    onChange={(e) => setFormData({ ...formData, total_pages: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="v1.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Current Version</Label>
                  <Switch
                    checked={formData.is_current}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Allow Download</Label>
                  <Switch
                    checked={formData.allow_download}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_download: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Require Email</Label>
                  <Switch
                    checked={formData.require_email}
                    onCheckedChange={(checked) => setFormData({ ...formData, require_email: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingBrochure ? 'Update' : 'Create'} Brochure
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
        {brochures.map((brochure) => (
          <Card key={brochure.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{brochure.title}</h3>
                      <Badge variant={brochure.is_current ? 'default' : 'secondary'}>
                        {getBrochureTypeLabel(brochure.brochure_type)}
                      </Badge>
                      {brochure.is_current && (
                        <Badge variant="default">Current</Badge>
                      )}
                      {!brochure.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    {brochure.description && (
                      <p className="text-sm text-gray-600 mb-2">{brochure.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      {brochure.version && <span>Version: {brochure.version}</span>}
                      {brochure.total_pages && <span>{brochure.total_pages} pages</span>}
                      {brochure.file_size && (
                        <span>{(brochure.file_size / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {brochure.download_count} downloads
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {brochure.allow_download && (
                        <Badge variant="outline">Download Enabled</Badge>
                      )}
                      {brochure.require_email && (
                        <Badge variant="outline">Email Required</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(brochure.file_url, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(brochure)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(brochure.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {brochures.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No brochures yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first brochure to get started
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Brochure
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
