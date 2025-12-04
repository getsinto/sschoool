'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GripVertical,
  ArrowUp,
  ArrowDown,
  Folder,
  FileText,
  CheckSquare,
  Square
} from 'lucide-react'
import { CourseResource, ResourceCategory } from '@/types/materials'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ResourceOrganizerProps {
  courseId: string
  onClose?: () => void
}

interface GroupedResources {
  [key: string]: CourseResource[]
}

export function ResourceOrganizer({ courseId, onClose }: ResourceOrganizerProps) {
  const [resources, setResources] = useState<CourseResource[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [groupBy, setGroupBy] = useState<'module' | 'category'>('module')
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadResources()
  }, [courseId])

  const loadResources = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/courses/${courseId}/resources`)
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      console.error('Failed to load resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupResources = (): GroupedResources => {
    const grouped: GroupedResources = {}

    resources.forEach(resource => {
      let key: string
      if (groupBy === 'module') {
        key = resource.module_id || 'unassigned'
      } else {
        key = resource.resource_category || 'uncategorized'
      }

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(resource)
    })

    return grouped
  }

  const moveResource = (resourceId: string, direction: 'up' | 'down') => {
    const index = resources.findIndex(r => r.id === resourceId)
    if (index === -1) return

    const newResources = [...resources]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newResources.length) return

    // Swap resources
    ;[newResources[index], newResources[targetIndex]] = [newResources[targetIndex], newResources[index]]

    // Update display_order
    newResources.forEach((resource, idx) => {
      resource.display_order = idx
    })

    setResources(newResources)
    setHasChanges(true)
  }

  const toggleResourceSelection = (resourceId: string) => {
    const newSelected = new Set(selectedResources)
    if (newSelected.has(resourceId)) {
      newSelected.delete(resourceId)
    } else {
      newSelected.add(resourceId)
    }
    setSelectedResources(newSelected)
  }

  const selectAll = () => {
    setSelectedResources(new Set(resources.map(r => r.id)))
  }

  const deselectAll = () => {
    setSelectedResources(new Set())
  }

  const bulkUpdateCategory = async (category: ResourceCategory) => {
    if (selectedResources.size === 0) return

    try {
      setSaving(true)
      const updates = Array.from(selectedResources).map(id => ({
        id,
        resource_category: category
      }))

      const response = await fetch(`/api/teacher/courses/${courseId}/resources/bulk-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })

      if (response.ok) {
        await loadResources()
        setSelectedResources(new Set())
      }
    } catch (error) {
      console.error('Failed to update resources:', error)
    } finally {
      setSaving(false)
    }
  }

  const saveOrder = async () => {
    try {
      setSaving(true)
      const updates = resources.map((resource, index) => ({
        id: resource.id,
        display_order: index
      }))

      const response = await fetch(`/api/teacher/courses/${courseId}/resources/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })

      if (response.ok) {
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Failed to save order:', error)
    } finally {
      setSaving(false)
    }
  }

  const getCategoryColor = (category?: ResourceCategory | null) => {
    switch (category) {
      case 'required': return 'bg-red-100 text-red-800'
      case 'optional': return 'bg-blue-100 text-blue-800'
      case 'supplementary': return 'bg-green-100 text-green-800'
      case 'reference': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const grouped = groupResources()

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading resources...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organize Resources</h2>
          <p className="text-gray-600">
            Reorder and categorize your course resources
          </p>
        </div>
        {hasChanges && (
          <Button onClick={saveOrder} disabled={saving}>
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
        )}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium mr-2">Group by:</label>
                <Select value={groupBy} onValueChange={(value: 'module' | 'category') => setGroupBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="module">Module</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedResources.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedResources.size} selected
                </span>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Clear
                </Button>
                <Select onValueChange={(value) => bulkUpdateCategory(value as ResourceCategory)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Set category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Required</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                    <SelectItem value="supplementary">Supplementary</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {resources.length > 0 && (
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grouped Resources */}
      {resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No resources to organize
            </h3>
            <p className="text-gray-600">
              Add some resources first to organize them
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, groupResources]) => (
            <Card key={group}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-600" />
                  <span className="capitalize">
                    {group === 'unassigned' ? 'Unassigned' : 
                     group === 'uncategorized' ? 'Uncategorized' : 
                     group}
                  </span>
                  <Badge variant="outline">{groupResources.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupResources.map((resource, index) => {
                    const isSelected = selectedResources.has(resource.id)
                    const isFirst = index === 0
                    const isLast = index === groupResources.length - 1

                    return (
                      <div
                        key={resource.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Selection Checkbox */}
                        <button
                          onClick={() => toggleResourceSelection(resource.id)}
                          className="flex-shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        {/* Drag Handle */}
                        <div className="flex-shrink-0 cursor-move text-gray-400">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Resource Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{resource.title}</h4>
                            <Badge variant="outline" className="capitalize text-xs">
                              {resource.resource_type}
                            </Badge>
                            {resource.resource_category && (
                              <Badge className={getCategoryColor(resource.resource_category)}>
                                {resource.resource_category}
                              </Badge>
                            )}
                          </div>
                          {resource.description && (
                            <p className="text-sm text-gray-600 truncate">
                              {resource.description}
                            </p>
                          )}
                        </div>

                        {/* Move Buttons */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveResource(resource.id, 'up')}
                            disabled={isFirst}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveResource(resource.id, 'down')}
                            disabled={isLast}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Save Changes Footer */}
      {hasChanges && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">You have unsaved changes</p>
                <p className="text-sm text-blue-700">
                  Save your changes to update the resource order
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadResources}>
                  Cancel
                </Button>
                <Button onClick={saveOrder} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Order'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
