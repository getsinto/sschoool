'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Save
} from 'lucide-react'
import { Worksheet, WorksheetFormData, DifficultyLevel } from '@/types/materials'
import { Badge } from '@/components/ui/badge'

interface WorksheetFormProps {
  courseId: string
  moduleId?: string
  worksheet?: Worksheet | null
  onClose: () => void
}

export function WorksheetForm({ courseId, moduleId, worksheet, onClose }: WorksheetFormProps) {
  const [formData, setFormData] = useState<WorksheetFormData>({
    title: worksheet?.title || '',
    description: worksheet?.description || '',
    instructions: worksheet?.instructions || '',
    difficulty_level: worksheet?.difficulty_level || undefined,
    estimated_minutes: worksheet?.estimated_minutes || undefined,
    worksheet_file_url: worksheet?.worksheet_file_url || '',
    answer_key_url: worksheet?.answer_key_url || '',
    requires_submission: worksheet?.requires_submission ?? false,
    download_allowed: worksheet?.download_allowed ?? true,
    print_allowed: worksheet?.print_allowed ?? true,
    max_grade: worksheet?.max_grade || 100,
    module_id: moduleId || worksheet?.module_id || undefined,
    tags: worksheet?.tags || []
  })

  const [worksheetFile, setWorksheetFile] = useState<File | null>(null)
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState('')

  const worksheetInputRef = useRef<HTMLInputElement>(null)
  const answerKeyInputRef = useRef<HTMLInputElement>(null)

  const updateField = (field: keyof WorksheetFormData, value: any) => {
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

  const handleWorksheetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, worksheet_file: 'Please upload a PDF, DOC, DOCX, PNG, or JPG file' }))
        return
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, worksheet_file: 'File size must be less than 50MB' }))
        return
      }
      setWorksheetFile(file)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.worksheet_file
        return newErrors
      })
    }
  }

  const handleAnswerKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, answer_key_file: 'Please upload a PDF, DOC, DOCX, PNG, or JPG file' }))
        return
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, answer_key_file: 'File size must be less than 50MB' }))
        return
      }
      setAnswerKeyFile(file)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.answer_key_file
        return newErrors
      })
    }
  }

  const uploadFile = async (file: File, type: 'worksheet' | 'answer_key'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch(`/api/teacher/courses/${courseId}/worksheets/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to upload ${type}`)
    }

    const data = await response.json()
    return data.url
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!worksheet && !worksheetFile) {
      newErrors.worksheet_file = 'Worksheet file is required'
    }

    if (formData.requires_submission && !formData.max_grade) {
      newErrors.max_grade = 'Max grade is required when submission is required'
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

      // Upload files if new ones are selected
      let worksheetUrl = formData.worksheet_file_url
      let answerKeyUrl = formData.answer_key_url

      if (worksheetFile) {
        setUploading(true)
        worksheetUrl = await uploadFile(worksheetFile, 'worksheet')
      }

      if (answerKeyFile) {
        setUploading(true)
        answerKeyUrl = await uploadFile(answerKeyFile, 'answer_key')
      }

      setUploading(false)

      // Prepare data
      const data = {
        ...formData,
        worksheet_file_url: worksheetUrl,
        answer_key_url: answerKeyUrl || undefined,
        course_id: courseId
      }

      // Save worksheet
      const url = worksheet
        ? `/api/teacher/courses/${courseId}/worksheets/${worksheet.id}`
        : `/api/teacher/courses/${courseId}/worksheets`
      
      const method = worksheet ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to save worksheet')
      }

      onClose()
    } catch (error) {
      console.error('Error saving worksheet:', error)
      setErrors(prev => ({ ...prev, submit: 'Failed to save worksheet. Please try again.' }))
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
            {worksheet ? 'Edit Worksheet' : 'Create Worksheet'}
          </h2>
          <p className="text-gray-600">
            {worksheet ? 'Update worksheet details' : 'Add a new practice worksheet'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>
                Worksheet Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Math Practice - Fractions"
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
                placeholder="Brief description of what this worksheet covers"
                rows={3}
              />
            </div>

            <div>
              <Label>Instructions for Students</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => updateField('instructions', e.target.value)}
                placeholder="Detailed instructions on how to complete this worksheet"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Difficulty Level</Label>
                <Select
                  value={formData.difficulty_level || 'none'}
                  onValueChange={(value) => updateField('difficulty_level', value === 'none' ? undefined : value as DifficultyLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estimated Time (minutes)</Label>
                <Input
                  type="number"
                  value={formData.estimated_minutes || ''}
                  onChange={(e) => updateField('estimated_minutes', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 30"
                  min="1"
                />
              </div>
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

        {/* File Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Worksheet File */}
            <div>
              <Label>
                Worksheet File <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                {formData.worksheet_file_url && !worksheetFile ? (
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
                      onClick={() => worksheetInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                  </div>
                ) : worksheetFile ? (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">{worksheetFile.name}</p>
                      <p className="text-xs text-blue-700">
                        {(worksheetFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setWorksheetFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => worksheetInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Click to upload worksheet
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, PNG, JPG up to 50MB
                    </p>
                  </div>
                )}
                <input
                  ref={worksheetInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleWorksheetFileChange}
                  className="hidden"
                />
                {errors.worksheet_file && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.worksheet_file}
                  </p>
                )}
              </div>
            </div>

            {/* Answer Key File */}
            <div>
              <Label>Answer Key (optional)</Label>
              <p className="text-xs text-gray-500 mb-2">
                Upload an answer key (hidden from students)
              </p>
              <div className="mt-2">
                {formData.answer_key_url && !answerKeyFile ? (
                  <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Answer key uploaded</p>
                      <p className="text-xs text-green-700">Click to replace</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => answerKeyInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                  </div>
                ) : answerKeyFile ? (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">{answerKeyFile.name}</p>
                      <p className="text-xs text-blue-700">
                        {(answerKeyFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAnswerKeyFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => answerKeyInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload answer key</p>
                  </div>
                )}
                <input
                  ref={answerKeyInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleAnswerKeyFileChange}
                  className="hidden"
                />
                {errors.answer_key_file && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.answer_key_file}
                  </p>
                )}
              </div>
            </div>
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
                <Label>Require Submission</Label>
                <p className="text-sm text-gray-500">
                  Students must upload their completed worksheet
                </p>
              </div>
              <Switch
                checked={formData.requires_submission}
                onCheckedChange={(checked) => updateField('requires_submission', checked)}
              />
            </div>

            {formData.requires_submission && (
              <div>
                <Label>
                  Maximum Grade <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.max_grade}
                  onChange={(e) => updateField('max_grade', parseInt(e.target.value) || 100)}
                  min="1"
                  className={errors.max_grade ? 'border-red-500' : ''}
                />
                {errors.max_grade && (
                  <p className="text-sm text-red-600 mt-1">{errors.max_grade}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Download</Label>
                <p className="text-sm text-gray-500">
                  Students can download the worksheet
                </p>
              </div>
              <Switch
                checked={formData.download_allowed}
                onCheckedChange={(checked) => updateField('download_allowed', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Print</Label>
                <p className="text-sm text-gray-500">
                  Students can print the worksheet
                </p>
              </div>
              <Switch
                checked={formData.print_allowed}
                onCheckedChange={(checked) => updateField('print_allowed', checked)}
              />
            </div>
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
                {worksheet ? 'Update Worksheet' : 'Create Worksheet'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
