'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'
import { 
  Module, 
  ModuleFormData, 
  ModuleStatus, 
  ModuleAccessType,
  MODULE_STATUS,
  MODULE_ACCESS_TYPES 
} from '@/types/lesson'

interface ModuleSettingsFormProps {
  module?: Module
  allModules?: Module[] // For prerequisite selection
  onChange: (data: ModuleFormData) => void
}

export function ModuleSettingsForm({ module, allModules = [], onChange }: ModuleSettingsFormProps) {
  const [formData, setFormData] = useState<ModuleFormData>({
    title: module?.title || '',
    description: module?.description || '',
    thumbnail_url: module?.thumbnail_url || '',
    prerequisites: module?.prerequisites || [],
    status: module?.status || 'draft',
    access_type: module?.access_type || 'enrolled_only'
  })

  // Update parent when form data changes
  useEffect(() => {
    onChange(formData)
  }, [formData, onChange])

  const handleChange = (field: keyof ModuleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file)
      handleChange('thumbnail_url', url)
      // TODO: Upload to storage and get real URL
    }
  }

  const togglePrerequisite = (moduleId: string) => {
    const current = formData.prerequisites || []
    const updated = current.includes(moduleId)
      ? current.filter(id => id !== moduleId)
      : [...current, moduleId]
    handleChange('prerequisites', updated)
  }

  // Filter out current module from prerequisites list
  const availablePrerequisites = allModules.filter(m => m.id !== module?.id)

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label>
            Module Title <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Introduction to Programming"
            required
          />
        </div>

        <div>
          <Label>Module Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Detailed description of what students will learn in this module"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 50 characters recommended. Supports formatting.
          </p>
        </div>
      </div>

      {/* Thumbnail */}
      <div>
        <Label>Module Thumbnail (optional)</Label>
        <p className="text-sm text-gray-600 mb-2">
          Small image shown in curriculum view
        </p>
        
        {formData.thumbnail_url ? (
          <div className="relative inline-block">
            <img
              src={formData.thumbnail_url}
              alt="Module thumbnail"
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleChange('thumbnail_url', '')}
              className="absolute -top-2 -right-2 bg-white rounded-full shadow"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Click to upload thumbnail</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Status and Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Module Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: ModuleStatus) => handleChange('status', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                <div>
                  <p className="font-medium">Draft</p>
                  <p className="text-xs text-gray-500">Not visible to students</p>
                </div>
              </SelectItem>
              <SelectItem value="published">
                <div>
                  <p className="font-medium">Published</p>
                  <p className="text-xs text-gray-500">Visible to enrolled students</p>
                </div>
              </SelectItem>
              <SelectItem value="archived">
                <div>
                  <p className="font-medium">Archived</p>
                  <p className="text-xs text-gray-500">Hidden but preserved</p>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Access Type</Label>
          <Select
            value={formData.access_type}
            onValueChange={(value: ModuleAccessType) => handleChange('access_type', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free_preview">
                <div>
                  <p className="font-medium">Free Preview</p>
                  <p className="text-xs text-gray-500">Anyone can access</p>
                </div>
              </SelectItem>
              <SelectItem value="enrolled_only">
                <div>
                  <p className="font-medium">Enrolled Only</p>
                  <p className="text-xs text-gray-500">Requires enrollment</p>
                </div>
              </SelectItem>
              <SelectItem value="locked">
                <div>
                  <p className="font-medium">Locked</p>
                  <p className="text-xs text-gray-500">Unlocks after prerequisites</p>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prerequisites */}
      {formData.access_type === 'locked' && availablePrerequisites.length > 0 && (
        <div>
          <Label>Prerequisites</Label>
          <p className="text-sm text-gray-600 mb-3">
            Select modules that must be completed before accessing this module
          </p>
          
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
            {availablePrerequisites.map((prereqModule) => (
              <label
                key={prereqModule.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.prerequisites?.includes(prereqModule.id) || false}
                  onChange={() => togglePrerequisite(prereqModule.id)}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{prereqModule.title}</p>
                  {prereqModule.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {prereqModule.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  Module {prereqModule.order_index + 1}
                </span>
              </label>
            ))}
          </div>

          {formData.prerequisites && formData.prerequisites.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              {formData.prerequisites.length} prerequisite(s) selected
            </p>
          )}
        </div>
      )}

      {/* Duration Info */}
      {module?.duration_minutes && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Label className="text-blue-900">Module Duration</Label>
          <p className="text-sm text-blue-700 mt-1">
            {Math.floor(module.duration_minutes / 60)} hours {module.duration_minutes % 60} minutes
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Auto-calculated from lesson durations
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use descriptive titles that clearly indicate the module content</li>
          <li>Add detailed descriptions to help students understand what they'll learn</li>
          <li>Set prerequisites to create a logical learning path</li>
          <li>Use "Free Preview" for introductory modules to attract students</li>
          <li>Module duration is automatically calculated from all lessons</li>
        </ul>
      </div>
    </div>
  )
}
