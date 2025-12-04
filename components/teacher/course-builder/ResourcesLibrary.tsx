'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Link as LinkIcon, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  ExternalLink,
  Video,
  BookOpen
} from 'lucide-react'
import { 
  CourseResource,
  ResourceType,
  ResourceCategory 
} from '@/types/materials'
import { ResourceForm } from './ResourceForm'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface ResourcesLibraryProps {
  courseId: string
  moduleId?: string
}

export function ResourcesLibrary({ courseId, moduleId }: ResourcesLibraryProps) {
  const [resources, setResources] = useState<CourseResource[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedResource, setSelectedResource] = useState<CourseResource | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    loadResources()
  }, [courseId, moduleId])

  const loadResources = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ course_id: courseId })
      if (moduleId) params.append('module_id', moduleId)
      
      const response = await fetch(`/api/teacher/courses/${courseId}/resources?${params}`)
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

  const handleCreate = () => {
    setSelectedResource(null)
    setShowForm(true)
  }

  const handleEdit = (resource: CourseResource) => {
    setSelectedResource(resource)
    setShowForm(true)
  }

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const response = await fetch(
        `/api/teacher/courses/${courseId}/resources/${resourceId}`,
        { method: 'DELETE' }
      )
      
      if (response.ok) {
        await loadResources()
      }
    } catch (error) {
      console.error('Failed to delete resource:', error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedResource(null)
    loadResources()
  }

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'link': return <ExternalLink className="w-5 h-5 text-blue-600" />
      case 'file': return <FileText className="w-5 h-5 text-green-600" />
      case 'video': return <Video className="w-5 h-5 text-red-600" />
      case 'document': return <BookOpen className="w-5 h-5 text-purple-600" />
      case 'reference': return <BookOpen className="w-5 h-5 text-indigo-600" />
      case 'tool': return <LinkIcon className="w-5 h-5 text-orange-600" />
      default: return <FileText className="w-5 h-5 text-gray-600" />
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

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || resource.resource_type === typeFilter
    const matchesCategory = categoryFilter === 'all' || resource.resource_category === categoryFilter
    return matchesSearch && matchesType && matchesCategory
  })

  const groupedResources = filteredResources.reduce((acc, resource) => {
    const type = resource.resource_type
    if (!acc[type]) acc[type] = []
    acc[type].push(resource)
    return acc
  }, {} as Record<string, CourseResource[]>)

  if (showForm) {
    return (
      <ResourceForm
        courseId={courseId}
        moduleId={moduleId}
        resource={selectedResource}
        onClose={handleFormClose}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resources Library</h2>
          <p className="text-gray-600">
            Manage additional learning resources for your course
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="link">Links</SelectItem>
                  <SelectItem value="file">Files</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="reference">References</SelectItem>
                  <SelectItem value="tool">Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="supplementary">Supplementary</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' 
                ? 'No resources found' 
                : 'No resources yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first resource to get started'}
            </p>
            {!searchQuery && typeFilter === 'all' && categoryFilter === 'all' && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="grid" className="w-full">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grouped">Grouped by Type</TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="grid" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getResourceIcon(resource.resource_type)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-2 truncate">
                            {resource.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="capitalize">
                              {resource.resource_type}
                            </Badge>
                            {resource.resource_category && (
                              <Badge className={getCategoryColor(resource.resource_category)}>
                                {resource.resource_category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resource.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {resource.description}
                      </p>
                    )}

                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {(resource.resource_url || resource.file_url) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(resource.resource_url || resource.file_url!, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                      )}
                      {resource.file_url && resource.download_allowed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = resource.file_url!
                            link.download = resource.title
                            link.click()
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(resource)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(resource.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredResources.map((resource) => (
                    <div key={resource.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        {getResourceIcon(resource.resource_type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-1">{resource.title}</h3>
                              {resource.description && (
                                <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {resource.resource_type}
                                </Badge>
                                {resource.resource_category && (
                                  <Badge className={getCategoryColor(resource.resource_category)}>
                                    {resource.resource_category}
                                  </Badge>
                                )}
                                {resource.tags?.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {(resource.resource_url || resource.file_url) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(resource.resource_url || resource.file_url!, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(resource)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(resource.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grouped View */}
          <TabsContent value="grouped" className="mt-6 space-y-6">
            {Object.entries(groupedResources).map(([type, typeResources]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {getResourceIcon(type as ResourceType)}
                    {type}s ({typeResources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {typeResources.map((resource) => (
                      <div key={resource.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium flex-1">{resource.title}</h4>
                          {resource.resource_category && (
                            <Badge className={getCategoryColor(resource.resource_category)} size="sm">
                              {resource.resource_category}
                            </Badge>
                          )}
                        </div>
                        {resource.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          {(resource.resource_url || resource.file_url) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resource.resource_url || resource.file_url!, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Open
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(resource)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(resource.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
