'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Download, FileText, Video, Book, BookOpen, Wrench, Link as LinkIcon, Lock } from 'lucide-react'
import type { CourseResource } from '@/types/materials'

interface ResourceCardProps {
  resource: CourseResource
  viewMode?: 'grid' | 'list'
}

export function ResourceCard({ resource, viewMode = 'grid' }: ResourceCardProps) {
  const getResourceIcon = () => {
    const iconClass = "h-8 w-8"
    switch (resource.resource_type) {
      case 'link':
        return <LinkIcon className={iconClass + " text-blue-600"} />
      case 'file':
        return <FileText className={iconClass + " text-green-600"} />
      case 'video':
        return <Video className={iconClass + " text-red-600"} />
      case 'document':
        return <Book className={iconClass + " text-purple-600"} />
      case 'reference':
        return <BookOpen className={iconClass + " text-orange-600"} />
      case 'tool':
        return <Wrench className={iconClass + " text-gray-600"} />
      default:
        return <FileText className={iconClass + " text-gray-600"} />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'required':
        return 'bg-red-100 text-red-800'
      case 'optional':
        return 'bg-blue-100 text-blue-800'
      case 'supplementary':
        return 'bg-green-100 text-green-800'
      case 'reference':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAccess = () => {
    const url = resource.resource_url || resource.file_url
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleDownload = () => {
    if (resource.file_url) {
      const link = document.createElement('a')
      link.href = resource.file_url
      link.download = resource.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4 flex-1">
          {getResourceIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{resource.title}</h3>
              <Badge className={getCategoryColor(resource.resource_category)}>
                {resource.resource_category}
              </Badge>
              {resource.requires_enrollment && (
                <Badge variant="outline" className="bg-yellow-50">
                  <Lock className="h-3 w-3 mr-1" />
                  Enrollment Required
                </Badge>
              )}
            </div>
            {resource.description && (
              <p className="text-sm text-gray-600 line-clamp-1">{resource.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {resource.resource_type === 'link' || resource.resource_type === 'video' ? (
            <Button size="sm" onClick={handleAccess}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={handleAccess}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Button>
              {resource.download_allowed && (
                <Button size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          {getResourceIcon()}
          <Badge className={getCategoryColor(resource.resource_category)}>
            {resource.resource_category}
          </Badge>
        </div>
        <CardTitle className="text-lg">{resource.title}</CardTitle>
      </CardHeader>

      <CardContent>
        {resource.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{resource.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium capitalize">{resource.resource_type}</span>
          </div>

          {resource.external_platform && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium">{resource.external_platform}</span>
            </div>
          )}

          {resource.file_size && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium">
                {(resource.file_size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}
        </div>

        {resource.requires_enrollment && (
          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
            <Lock className="h-4 w-4 text-yellow-600" />
            <span className="text-xs text-yellow-800">Enrollment Required</span>
          </div>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {resource.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {resource.resource_type === 'link' || resource.resource_type === 'video' ? (
          <Button size="sm" onClick={handleAccess} className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Resource
          </Button>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={handleAccess} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </Button>
            {resource.download_allowed && (
              <Button size="sm" onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}
