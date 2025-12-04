'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, X, Upload, FileText, Image, Link as LinkIcon, 
  Code, File, MoveUp, MoveDown 
} from 'lucide-react'
import { LessonResource, ResourceType, RESOURCE_TYPES } from '@/types/lesson'

interface LessonResourcesManagerProps {
  resources?: LessonResource[]
  onChange: (resources: LessonResource[]) => void
}

export function LessonResourcesManager({ resources = [], onChange }: LessonResourcesManagerProps) {
  const [resourceList, setResourceList] = useState<LessonResource[]>(resources)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newResource, setNewResource] = useState<Partial<LessonResource>>({
    resource_type: 'pdf',
    resource_name: '',
    resource_url: '',
    resource_description: '',
    can_download: true,
    display_order: resourceList.length
  })

  const updateResources = (updated: LessonResource[]) => {
    setResourceList(updated)
    onChange(updated)
  }

  const addResource = () => {
    if (!newResource.resource_name || !newResource.resource_url) {
      alert('Please provide resource name and URL')
      return
    }

    const resource: LessonResource = {
      id: `resource-${Date.now()}`,
      lesson_id: '', // Will be set when saving lesson
      resource_type: newResource.resource_type as ResourceType,
      resource_name: newResource.resource_name,
      resource_url: newResource.resource_url,
      resource_description: newResource.resource_description || null,
      file_size: newResource.file_size || null,
      can_download: newResource.can_download ?? true,
      display_order: resourceList.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    updateResources([...resourceList, resource])
    
    // Reset form
    setNewResource({
      resource_type: 'pdf',
      resource_name: '',
      resource_url: '',
      resource_description: '',
      can_download: true,
      display_order: resourceList.length + 1
    })
    setShowAddForm(false)
  }

  const removeResource = (id: string) => {
    const updated = resourceList.filter(r => r.id !== id)
    // Reorder
    updated.forEach((r, index) => {
      r.display_order = index
    })
    updateResources(updated)
  }

  const moveResource = (id: string, direction: 'up' | 'down') => {
    const index = resourceList.findIndex(r => r.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= resourceList.length) return

    const updated = [...resourceList]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)

    // Update order
    updated.forEach((r, idx) => {
      r.display_order = idx
    })

    updateResources(updated)
  }

  const updateResource = (id: string, updates: Partial<LessonResource>) => {
    const updated = resourceList.map(r =>
      r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
    )
    updateResources(updated)
  }

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="w-5 h-5 text-red-600" />
      case 'image':
        return <Image className="w-5 h-5 text-blue-600" />
      case 'link':
        return <LinkIcon className="w-5 h-5 text-green-600" />
      case 'code':
        return <Code className="w-5 h-5 text-purple-600" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return 'Unknown size'
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Lesson Resources</Label>
          <p className="text-sm text-gray-600">
            Add supplementary materials, links, and downloadable files
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          variant={showAddForm ? 'outline' : 'default'}
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </>
          )}
        </Button>
      </div>

      {/* Add Resource Form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Resource Type</Label>
              <Select
                value={newResource.resource_type}
                onValueChange={(value: ResourceType) =>
                  setNewResource({ ...newResource, resource_type: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="document">Document (DOC, DOCX, etc.)</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                  <SelectItem value="code">Code File</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Resource Name</Label>
              <Input
                value={newResource.resource_name}
                onChange={(e) =>
                  setNewResource({ ...newResource, resource_name: e.target.value })
                }
                placeholder="e.g., Course Workbook"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">URL or File</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="url"
                value={newResource.resource_url}
                onChange={(e) =>
                  setNewResource({ ...newResource, resource_url: e.target.value })
                }
                placeholder="https://... or upload file"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Implement file upload
                  alert('File upload coming soon')
                }}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              value={newResource.resource_description}
              onChange={(e) =>
                setNewResource({ ...newResource, resource_description: e.target.value })
              }
              placeholder="Brief description of this resource"
              rows={2}
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Allow Download</Label>
              <p className="text-xs text-gray-500">Students can download this file</p>
            </div>
            <Switch
              checked={newResource.can_download ?? true}
              onCheckedChange={(checked) =>
                setNewResource({ ...newResource, can_download: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={addResource}>
              Add Resource
            </Button>
          </div>
        </div>
      )}

      {/* Resource List */}
      {resourceList.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No resources added yet</p>
          <p className="text-sm text-gray-400">Click "Add Resource" to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resourceList.map((resource, index) => (
            <div
              key={resource.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-white hover:bg-gray-50"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {getResourceIcon(resource.resource_type)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{resource.resource_name}</p>
                  <span className="text-xs text-gray-500 uppercase">
                    {resource.resource_type}
                  </span>
                  {!resource.can_download && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      View Only
                    </span>
                  )}
                </div>
                {resource.resource_description && (
                  <p className="text-xs text-gray-600 truncate">
                    {resource.resource_description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <a
                    href={resource.resource_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline truncate max-w-xs"
                  >
                    {resource.resource_url}
                  </a>
                  {resource.file_size && (
                    <span className="text-xs text-gray-500">
                      {formatFileSize(resource.file_size)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveResource(resource.id, 'up')}
                  disabled={index === 0}
                >
                  <MoveUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveResource(resource.id, 'down')}
                  disabled={index === resourceList.length - 1}
                >
                  <MoveDown className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResource(resource.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
