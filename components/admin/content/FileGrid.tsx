'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileVideo, 
  FileImage, 
  FileText, 
  Music,
  File,
  Download,
  Share2,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  HardDrive,
  Clock
} from 'lucide-react'

interface FileData {
  id: string
  name: string
  type: string
  fileType?: string
  mimeType?: string
  size: number
  url: string
  thumbnail?: string
  thumbnailUrl?: string
  uploadedBy: string | { id: string; name: string }
  uploadedAt: string
  folder?: string
  folderId?: string
  metadata?: {
    duration?: number
    dimensions?: { width: number; height: number }
    pages?: number
  }
  usage?: Array<{
    courseId: string
    courseTitle: string
    usageType: 'lesson' | 'assignment' | 'resource'
  }>
  usageCount?: number
  usedInCourses?: string[]
  isPublic?: boolean
}

interface FileGridProps {
  files: FileData[]
  viewMode: 'grid' | 'list'
  selectedFiles: string[]
  onSelectionChange?: (selectedFiles: string[]) => void
  onFileSelect?: (selectedFiles: string[]) => void
  onFilePreview: (file: FileData) => void
  onFileShare?: (file: FileData) => void
  isLoading?: boolean
  currentFolder?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const getFileIcon = (type: string) => {
  const fileType = type.toLowerCase()
  if (fileType.includes('video') || type === 'video') return FileVideo
  if (fileType.includes('image') || type === 'image') return FileImage
  if (fileType.includes('audio') || type === 'audio') return Music
  if (fileType.includes('pdf') || fileType.includes('document') || type === 'document') return FileText
  return File
}

const getFileTypeColor = (type: string) => {
  const fileType = type.toLowerCase()
  if (fileType.includes('video') || type === 'video') return 'bg-blue-100 text-blue-800'
  if (fileType.includes('image') || type === 'image') return 'bg-green-100 text-green-800'
  if (fileType.includes('audio') || type === 'audio') return 'bg-purple-100 text-purple-800'
  if (fileType.includes('pdf') || fileType.includes('document') || type === 'document') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

function FileGrid({ 
  files, 
  viewMode, 
  selectedFiles, 
  onSelectionChange,
  onFileSelect,
  onFilePreview,
  onFileShare,
  isLoading,
  currentFolder
}: FileGridProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)

  const handleFileSelection = (fileId: string, isSelected: boolean) => {
    let newSelection: string[]
    
    if (isSelected) {
      newSelection = [...selectedFiles, fileId]
    } else {
      newSelection = selectedFiles.filter(id => id !== fileId)
    }
    
    if (onSelectionChange) {
      onSelectionChange(newSelection)
    } else if (onFileSelect) {
      onFileSelect(newSelection)
    }
  }

  const handleSelectAll = () => {
    const allFileIds = files.map(file => file.id)
    const newSelection = selectedFiles.length === files.length ? [] : allFileIds
    
    if (onSelectionChange) {
      onSelectionChange(newSelection)
    } else if (onFileSelect) {
      onFileSelect(newSelection)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
        <p className="text-gray-600">Upload some files to get started</p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
          <div className="flex items-center space-x-3 flex-1">
            <input
              type="checkbox"
              checked={selectedFiles.length === files.length && files.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <span>Name</span>
          </div>
          <div className="w-20 text-center">Type</div>
          <div className="w-24 text-center">Size</div>
          <div className="w-32 text-center">Modified</div>
          <div className="w-32 text-center">Uploaded By</div>
          <div className="w-16"></div>
        </div>

        {/* File Rows */}
        {files.map((file) => {
          const FileIcon = getFileIcon(file.type || file.fileType || file.mimeType || '')
          const isSelected = selectedFiles.includes(file.id)
          const uploaderName = typeof file.uploadedBy === 'string' 
            ? file.uploadedBy 
            : file.uploadedBy.name

          return (
            <div
              key={file.id}
              className={`flex items-center p-3 rounded-lg border transition-colors ${
                isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredFile(file.id)}
              onMouseLeave={() => setHoveredFile(null)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleFileSelection(file.id, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <FileIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  {file.metadata?.duration && (
                    <p className="text-sm text-gray-500">
                      Duration: {formatDuration(file.metadata.duration)}
                    </p>
                  )}
                  {file.metadata?.dimensions && (
                    <p className="text-sm text-gray-500">
                      {file.metadata.dimensions.width} × {file.metadata.dimensions.height}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="w-20 text-center">
                <Badge className={getFileTypeColor(file.type || file.fileType || '')}>
                  {(file.type || file.fileType || 'file').toUpperCase()}
                </Badge>
              </div>
              
              <div className="w-24 text-center text-sm text-gray-600">
                {formatFileSize(file.size)}
              </div>
              
              <div className="w-32 text-center text-sm text-gray-600">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </div>
              
              <div className="w-32 text-center text-sm text-gray-600 truncate">
                {uploaderName}
              </div>
              
              <div className="w-16 flex justify-center">
                {hoveredFile === file.id && (
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFilePreview(file)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {onFileShare && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onFileShare(file)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => {
        const FileIcon = getFileIcon(file.type || file.fileType || file.mimeType || '')
        const isSelected = selectedFiles.includes(file.id)
        const uploaderName = typeof file.uploadedBy === 'string' 
          ? file.uploadedBy 
          : file.uploadedBy.name

        return (
          <Card
            key={file.id}
            className={`cursor-pointer transition-all duration-200 ${
              isSelected 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md hover:scale-105'
            }`}
            onMouseEnter={() => setHoveredFile(file.id)}
            onMouseLeave={() => setHoveredFile(null)}
          >
            <CardContent className="p-4">
              {/* Selection Checkbox */}
              <div className="flex items-center justify-between mb-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleFileSelection(file.id, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Badge className={getFileTypeColor(file.type || file.fileType || '')}>
                  {(file.type || file.fileType || 'file').toUpperCase()}
                </Badge>
              </div>

              {/* File Preview */}
              <div 
                className="relative mb-4 bg-gray-100 rounded-lg aspect-video flex items-center justify-center overflow-hidden"
                onClick={() => onFilePreview(file)}
              >
                {file.thumbnail || file.thumbnailUrl ? (
                  <img
                    src={file.thumbnail || file.thumbnailUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileIcon className="w-12 h-12 text-gray-400" />
                )}
                
                {/* Overlay on hover */}
                {hoveredFile === file.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatFileSize(file.size)}</span>
                  {file.metadata?.duration && (
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(file.metadata.duration)}
                    </span>
                  )}
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  <User className="w-3 h-3 mr-1" />
                  <span className="truncate">{uploaderName}</span>
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                </div>

                {(file.usageCount || file.usedInCourses?.length) && (
                  <div className="text-xs text-blue-600">
                    Used in {file.usageCount || file.usedInCourses?.length || 0} courses
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {hoveredFile === file.id && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                    {onFileShare && (
                      <Button size="sm" variant="ghost" onClick={() => onFileShare(file)}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Export FileGrid component as default
export default FileGrid

