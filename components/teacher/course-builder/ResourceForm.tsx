'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Save,
  Link as LinkIcon,
  Video,
  BookOpen,
  ExternalLink
} from 'lucide-react'
import { 
  CourseResource, 
  ResourceFormData, 
  ResourceType,
  ResourceCategory 
} from '@/types/materials'

interface ResourceFormProps {
  courseId: string
  moduleId?: string
  resource?: CourseResource | null
  onClose: () => void
}

export function ResourceForm({ courseId, moduleId, resource, onClose }: ResourceFormProps) {
  const [formData, setFormData] = useState<ResourceFormData>({
    title: resource?.title || '',
    description: resource?.description || '',
    resource_type: resource?.resource_type || 'link',
    resource_category: resource?.resource_category || undefined,
    resource_url: resource?.resource_url || '',
    file_url: resource?.file_url || '',
    external_platform: resource?.external_platform || '',
    download_allowed: resource?.download_allowed ?? true,
    requires_enrollment: resource?.requires_enrollment ?? true,
    module_id: moduleId || resource?.module_id || undefined,
    tags: resource?.tags || []
  })

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateField = (field: keyof ResourceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 100MB' }))
        return
      }
      setFile(selectedFile)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.file
        return newErrors
      })
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'resource')

    const response = await fetch(`/api/teacher/courses/${courseId}/resources/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload file')
    }

    const data = await response.json()
    return data.url
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.resource_type === 'link' && !formData.resource_url.trim()) {
      newErrors.resource_url = 'URL is required for link resources'
    }

    if (formData.resource_type === 'file' && !resource && !file) {
      newErrors.file = 'File is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setSaving(true)

      // Upload file if new one is selected
      let fileUrl = formData.file_url
      if (file) {
        setUploading(true)
        fileUrl = await uploadFile(file)
        setUploading(false)
      }

      // Prepare data
      const data = {
        ...formData,
        file_url: formData.resource_type === 'file' ? fileUrl : undefined,
        resource_url: formData.resource_type === 'link' ? formData.resource_url : undefined,
        course_id: courseId
      }

      // Save resource
      const url = resource
        ? `/api/teacher/courses/${courseId}/resources/${resource.id}`
        : `/api/teacher/courses/${courseId}/resources`
      
      const method = resource ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to save resource')
      }

      onClose()
    } catch (error) {
      console.error('Error saving resource:', error)
      setErrors(prev => ({ ...prev, submit: 'Failed to save resource. Please try again.' }))
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      updateField('tags', [...(formData.tags || []), tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    updateField('tags', formData.tags?.filter(t => t !== tag) || [])
  }

  const getResourceTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'link': return <ExternalLink className="w-5 h-5" />
      case 'file': return <FileText className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'document': return <BookOpen className="w-5 h-5" />
      case 'reference': return <BookOpen className="w-5 h-5" />
      case 'tool': return <LinkIcon className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {resource ? 'Edit Resource' : 'Add Resource'}
          </h2>
          <p className="text-gray-600">
            {resource ? 'Update resource details' : 'Add a new learning resource'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resource Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.resource_type}
              onValueChange={(value) => updateField('resource_type', value as ResourceType)}
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="link" id="link" />
                <Label htmlFor="link" className="flex items-center gap-2 cursor-pointer flex-1">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">External Link</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="file" id="file" />
                <Label htmlFor="file" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm">File Upload</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Video className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Video</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="document" id="document" />
                <Label htmlFor="document" className="flex items-center gap-2 cursor-pointer flex-1">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Document</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="reference" id="reference" />
                <Label htmlFor="reference" className="flex items-center gap-2 cursor-pointer flex-1">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Reference</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="tool" id="tool" />
                <Label htmlFor="tool" className="flex items-center gap-2 cursor-pointer flex-1">
                  <LinkIcon className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Tool/Software</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>
                Resource Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Python Documentation, Tutorial Video"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief description of this resource"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.resource_category || 'none'}
                  onValueChange={(value) => updateField('resource_category', value === 'none' ? undefined : value as ResourceCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="required">Required</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                    <SelectItem value="supplementary">Supplementary</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.resource_type === 'link' && (
                <div>
                  <Label>Platform (optional)</Label>
                  <Input
                    value={formData.external_platform}
                    onChange={(e) => updateField('external_platform', e.target.value)}
                    placeholder="e.g., YouTube, GitHub, Coursera"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <Label>Tags (optional)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resource Content */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.resource_type === 'link' ? (
              <div>
                <Label>
                  URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="url"
                  value={formData.resource_url}
                  onChange={(e) => updateField('resource_url', e.target.value)}
                  placeholder="https://example.com/resource"
                  className={errors.resource_url ? 'border-red-500' : ''}
                />
                {errors.resource_url && (
                  <p className="text-sm text-red-600 mt-1">{errors.resource_url}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter the full URL including https://
                </p>
              </div>
            ) : (
              <div>
                <Label>
                  File Upload <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  {formData.file_url && !file ? (
                    <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">File uploaded</p>
                        <p className="text-xs text-green-700">Click to replace</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : file ? (
                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">{file.name}</p>
                        <p className="text-xs text-blue-700">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Click to upload file
                      </p>
                      <p className="text-xs text-gray-500">
                        Any file type up to 100MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {errors.file && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.file}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Requires Enrollment</Label>
                <p className="text-sm text-gray-500">
                  Only enrolled students can access this resource
                </p>
              </div>
              <Switch
                checked={formData.requires_enrollment}
                onCheckedChange={(checked) => updateField('requires_enrollment', checked)}
              />
            </div>

            {formData.resource_type === 'file' && (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Download</Label>
                  <p className="text-sm text-gray-500">
                    Students can download this file
                  </p>
                </div>
                <Switch
                  checked={formData.download_allowed}
                  onCheckedChange={(checked) => updateField('download_allowed', checked)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || uploading}>
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {resource ? 'Update Resource' : 'Add Resource'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
