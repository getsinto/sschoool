'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ResourceCard } from '@/components/student/resources/ResourceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Grid, List, Layers, BookOpen, Link as LinkIcon, FileText, Video, Book, Wrench } from 'lucide-react'
import type { CourseResource } from '@/types/materials'

export default function StudentResourcesPage() {
  const params = useParams()
  const courseId = params.id as string

  const [resources, setResources] = useState<CourseResource[]>([])
  const [filteredResources, setFilteredResources] = useState<CourseResource[]>([])
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'grouped'>('grid')

  useEffect(() => {
    fetchResources()
  }, [courseId])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, typeFilter, categoryFilter])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/student/courses/${courseId}/resources`)
      if (!response.ok) throw new Error('Failed to fetch resources')
      const data = await response.json()
      setResources(data.resources)
      setIsEnrolled(data.is_enrolled)
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterResources = () => {
    let filtered = [...resources]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((r) => r.resource_type === typeFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((r) => r.resource_category === categoryFilter)
    }

    setFilteredResources(filtered)
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <LinkIcon className="h-5 w-5" />
      case 'file':
        return <FileText className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'document':
        return <Book className="h-5 w-5" />
      case 'reference':
        return <BookOpen className="h-5 w-5" />
      case 'tool':
        return <Wrench className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStats = () => {
    const byType = {
      link: resources.filter((r) => r.resource_type === 'link').length,
      file: resources.filter((r) => r.resource_type === 'file').length,
      video: resources.filter((r) => r.resource_type === 'video').length,
      document: resources.filter((r) => r.resource_type === 'document').length,
      reference: resources.filter((r) => r.resource_type === 'reference').length,
      tool: resources.filter((r) => r.resource_type === 'tool').length
    }

    const byCategory = {
      required: resources.filter((r) => r.resource_category === 'required').length,
      optional: resources.filter((r) => r.resource_category === 'optional').length,
      supplementary: resources.filter((r) => r.resource_category === 'supplementary').length,
      reference: resources.filter((r) => r.resource_category === 'reference').length
    }

    return { byType, byCategory, total: resources.length }
  }

  const stats = getStats()

  const groupedResources = () => {
    const grouped: Record<string, CourseResource[]> = {}
    filteredResources.forEach((resource) => {
      const category = resource.resource_category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(resource)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Course Resources</h1>
        <p className="text-gray-600">
          Additional learning materials and references for this course
        </p>
        {!isEnrolled && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Some resources may be restricted. Enroll in this course to access all materials.
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Total Resources</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Required</p>
          <p className="text-2xl font-bold text-red-600">{stats.byCategory.required}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Optional</p>
          <p className="text-2xl font-bold text-blue-600">{stats.byCategory.optional}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Supplementary</p>
          <p className="text-2xl font-bold text-green-600">{stats.byCategory.supplementary}</p>
        </div>
      </div>

      {/* Filters and View Mode */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
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

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
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

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grouped')}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resources Display */}
      {filteredResources.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No resources found</h3>
          <p className="text-gray-600">
            {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No resources have been added to this course yet'}
          </p>
        </div>
      ) : viewMode === 'grouped' ? (
        <div className="space-y-8">
          {Object.entries(groupedResources()).map(([category, categoryResources]) => (
            <div key={category}>
              <h2 className="text-xl font-bold mb-4 capitalize">{category} Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} viewMode="list" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
