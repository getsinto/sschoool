'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  FileText, Image, Link as LinkIcon, Code, File, 
  Download, ExternalLink, Eye, Lock 
} from 'lucide-react'
import { LessonResource, ResourceType } from '@/types/lesson'

interface LessonResourcesListProps {
  resources: LessonResource[]
  isEnrolled?: boolean
  onDownload?: (resource: LessonResource) => void
}

export function LessonResourcesList({ 
  resources, 
  isEnrolled = false,
  onDownload 
}: LessonResourcesListProps) {
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())

  // Group resources by type
  const groupedResources = resources.reduce((acc, resource) => {
    const type = resource.resource_type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(resource)
    return acc
  }, {} as Record<ResourceType, LessonResource[]>)

  // Get icon for resource type
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

  // Get type label
  const getTypeLabel = (type: ResourceType): string => {
    const labels: Record<ResourceType, string> = {
      pdf: 'PDF Documents',
      document: 'Documents',
      image: 'Images',
      link: 'External Links',
      code: 'Code Files',
      other: 'Other Resources'
    }
    return labels[type] || 'Resources'
  }

  // Format file size
  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return ''
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  // Handle download
  const handleDownload = async (resource: LessonResource) => {
    if (!resource.can_download || !isEnrolled) return

    setDownloadingIds(prev => new Set(prev).add(resource.id))

    try {
      if (onDownload) {
        await onDownload(resource)
      } else {
        // Default download behavior
        const link = document.createElement('a')
        link.href = resource.resource_url || ''
        link.download = resource.resource_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download resource. Please try again.')
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(resource.id)
        return newSet
      })
    }
  }

  // Handle view/open
  const handleView = (resource: LessonResource) => {
    if (!isEnrolled && resource.resource_type !== 'link') return

    window.open(resource.resource_url || '', '_blank', 'noopener,noreferrer')
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>No resources available for this lesson</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lesson Resources</h3>
          <p className="text-sm text-gray-600">
            {resources.length} {resources.length === 1 ? 'resource' : 'resources'} available
          </p>
        </div>
        {!isEnrolled && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
            <Lock className="w-4 h-4" />
            <span>Enroll to access resources</span>
          </div>
        )}
      </div>

      {/* Resources by Type */}
      {Object.entries(groupedResources).map(([type, typeResources]) => (
        <div key={type} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {getResourceIcon(type as ResourceType)}
            {getTypeLabel(type as ResourceType)} ({typeResources.length})
          </h4>

          <div className="space-y-2">
            {typeResources.map((resource) => {
              const isDownloading = downloadingIds.has(resource.id)
              const canAccess = isEnrolled || resource.resource_type === 'link'
              const canDownload = resource.can_download && canAccess

              return (
                <div
                  key={resource.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                    canAccess 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-gray-50 opacity-60'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getResourceIcon(resource.resource_type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {resource.resource_name}
                      </p>
                      {!canAccess && (
                        <Lock className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    {resource.resource_description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {resource.resource_description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {resource.file_size && (
                        <span className="text-xs text-gray-500">
                          {formatFileSize(resource.file_size)}
                        </span>
                      )}
                      {resource.resource_type === 'link' && (
                        <span className="text-xs text-blue-600">External Link</span>
                      )}
                      {!resource.can_download && canAccess && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          View Only
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* View/Open Button */}
                    {canAccess && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(resource)}
                        disabled={!resource.resource_url}
                      >
                        {resource.resource_type === 'link' ? (
                          <>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Open
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </>
                        )}
                      </Button>
                    )}

                    {/* Download Button */}
                    {canDownload && resource.resource_type !== 'link' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(resource)}
                        disabled={isDownloading || !resource.resource_url}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {isDownloading ? 'Downloading...' : 'Download'}
                      </Button>
                    )}

                    {/* Locked State */}
                    {!canAccess && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="opacity-50"
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        Locked
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Footer Note */}
      {!isEnrolled && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Enroll in this course to access all downloadable resources and materials
          </p>
        </div>
      )}
    </div>
  )
}
