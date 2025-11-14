'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  File, 
  Video, 
  Image, 
  FileText, 
  Music,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface FileUpload {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  url?: string
}

interface FileUploaderProps {
  isOpen: boolean
  onClose: () => void
  currentFolder: string
  onUploadComplete: (files: any[]) => void
  maxFileSize?: number
  allowedTypes?: string[]
}

const SUPPORTED_FORMATS = {
  video: {
    extensions: ['.mp4', '.mov', '.avi'],
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    icon: Video,
    color: 'text-red-600'
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'],
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: FileText,
    color: 'text-blue-600'
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.svg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: Image,
    color: 'text-green-600'
  },
  audio: {
    extensions: ['.mp3', '.wav'],
    maxSize: 20 * 1024 * 1024, // 20MB
    icon: Music,
    color: 'text-purple-600'
  }
}

function FileUploader({ currentFolder, onUploadComplete, onClose }: FileUploaderProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileType = (file: File): keyof typeof SUPPORTED_FORMATS | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    for (const [type, config] of Object.entries(SUPPORTED_FORMATS)) {
      if (config.extensions.includes(extension)) {
        return type as keyof typeof SUPPORTED_FORMATS
      }
    }
    return null
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const fileType = getFileType(file)
    
    if (!fileType) {
      return { 
        valid: false, 
        error: `Unsupported file type. Supported: ${Object.values(SUPPORTED_FORMATS).flatMap(f => f.extensions).join(', ')}` 
      }
    }

    const config = SUPPORTED_FORMATS[fileType]
    if (file.size > config.maxSize) {
      const maxSizeMB = config.maxSize / (1024 * 1024)
      return { 
        valid: false, 
        error: `File too large. Maximum size for ${fileType}: ${maxSizeMB}MB` 
      }
    }

    return { valid: true }
  }

  const handleFiles = useCallback((files: FileList) => {
    const newUploads: FileUpload[] = []
    
    Array.from(files).forEach((file) => {
      const validation = validateFile(file)
      
      const upload: FileUpload = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: validation.valid ? 'pending' : 'error',
        error: validation.error
      }
      
      newUploads.push(upload)
    })

    setUploads(prev => [...prev, ...newUploads])
    
    // Start uploading valid files
    newUploads
      .filter(upload => upload.status === 'pending')
      .forEach(upload => startUpload(upload))
  }, [])

  const startUpload = async (upload: FileUpload) => {
    setUploads(prev => prev.map(u => 
      u.id === upload.id ? { ...u, status: 'uploading' } : u
    ))

    try {
      // Simulate chunked upload with progress
      const chunkSize = 1024 * 1024 // 1MB chunks
      const totalChunks = Math.ceil(upload.file.size / chunkSize)
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, upload.file.size)
        const chunk = upload.file.slice(start, end)
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const progress = Math.round(((i + 1) / totalChunks) * 100)
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress } : u
        ))
      }

      // Simulate successful upload
      const mockUrl = `/content/${currentFolder}/${upload.file.name}`
      
      setUploads(prev => prev.map(u => 
        u.id === upload.id 
          ? { ...u, status: 'completed', progress: 100, url: mockUrl }
          : u
      ))

      // Generate thumbnail for videos
      if (getFileType(upload.file) === 'video') {
        generateVideoThumbnail(upload.file, mockUrl)
      }

    } catch (error) {
      setUploads(prev => prev.map(u => 
        u.id === upload.id 
          ? { ...u, status: 'error', error: 'Upload failed' }
          : u
      ))
    }
  }

  const generateVideoThumbnail = async (file: File, url: string) => {
    // In real app, this would call the thumbnail generation API
    console.log('Generating thumbnail for video:', file.name)
  }

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id))
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const getFileIcon = (file: File) => {
    const fileType = getFileType(file)
    if (!fileType) return File
    
    const config = SUPPORTED_FORMATS[fileType]
    return config.icon
  }

  const getFileIconColor = (file: File) => {
    const fileType = getFileType(file)
    if (!fileType) return 'text-gray-600'
    
    const config = SUPPORTED_FORMATS[fileType]
    return config.color
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const completedUploads = uploads.filter(u => u.status === 'completed')
  const hasUploads = uploads.length > 0

  const handleComplete = () => {
    if (completedUploads.length > 0) {
      onUploadComplete(completedUploads.map(u => ({
        name: u.file.name,
        size: u.file.size,
        type: getFileType(u.file),
        url: u.url,
        folder: currentFolder
      })))
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload Files to {currentFolder}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-gray-600 mb-4">
              Support for videos, documents, images, and audio files
            </p>
            
            <Button onClick={() => fileInputRef.current?.click()}>
              Select Files
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept={Object.values(SUPPORTED_FORMATS).flatMap(f => f.extensions).join(',')}
            />
          </div>

          {/* Supported Formats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(SUPPORTED_FORMATS).map(([type, config]) => {
              const Icon = config.icon
              return (
                <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${config.color}`} />
                  <h4 className="font-medium text-sm capitalize">{type}</h4>
                  <p className="text-xs text-gray-500">
                    Max: {config.maxSize / (1024 * 1024)}MB
                  </p>
                </div>
              )
            })}
          </div>

          {/* Upload Progress */}
          {hasUploads && (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              <h4 className="font-medium text-gray-900">Upload Progress</h4>
              {uploads.map((upload) => {
                const Icon = getFileIcon(upload.file)
                const iconColor = getFileIconColor(upload.file)
                
                return (
                  <div key={upload.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <Icon className={`w-8 h-8 ${iconColor}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {upload.file.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(upload.file.size)}
                        </span>
                      </div>
                      
                      {upload.status === 'uploading' && (
                        <div className="space-y-1">
                          <Progress value={upload.progress} className="h-2" />
                          <p className="text-xs text-gray-600">{upload.progress}% uploaded</p>
                        </div>
                      )}
                      
                      {upload.status === 'error' && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">{upload.error}</span>
                        </div>
                      )}
                      
                      {upload.status === 'completed' && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Upload completed</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {upload.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                      
                      {upload.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      
                      {upload.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUpload(upload.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {completedUploads.length > 0 && (
                <span>{completedUploads.length} file(s) uploaded successfully</span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={completedUploads.length === 0}
              >
                Done ({completedUploads.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FileUploader