'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, X, GripVertical, Star } from 'lucide-react'

interface DocumentFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  isPrimary: boolean
}

interface DocumentUploaderProps {
  value?: DocumentFile[]
  onChange: (files: DocumentFile[]) => void
}

export function DocumentUploader({ value = [], onChange }: DocumentUploaderProps) {
  const [files, setFiles] = useState<DocumentFile[]>(value)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: DocumentFile[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type`)
        continue
      }

      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 50MB`)
        continue
      }

      try {
        // Upload to server
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'document')
        
        const response = await fetch('/api/upload/file', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          alert(`Failed to upload ${file.name}: ${errorData.error || 'Unknown error'}`)
          continue
        }

        const data = await response.json()

        newFiles.push({
          id: data.id || `doc-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: data.url,
          isPrimary: files.length === 0 && i === 0 // First file is primary
        })
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        alert(`Failed to upload ${file.name}. Please try again.`)
      }
    }

    const updated = [...files, ...newFiles]
    setFiles(updated)
    onChange(updated)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeFile = (id: string) => {
    const updated = files.filter(f => f.id !== id)
    
    // If removed file was primary, make first file primary
    if (updated.length > 0 && !updated.some(f => f.isPrimary)) {
      updated[0].isPrimary = true
    }
    
    setFiles(updated)
    onChange(updated)
  }

  const setPrimary = (id: string) => {
    const updated = files.map(f => ({
      ...f,
      isPrimary: f.id === id
    }))
    setFiles(updated)
    onChange(updated)
  }

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= files.length) return

    const updated = [...files]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp

    setFiles(updated)
    onChange(updated)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word')) return '📝'
    if (type.includes('powerpoint') || type.includes('presentation')) return '📊'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📈'
    return '📎'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX up to 50MB
          </p>
          <p className="text-xs text-gray-500 mt-1">
            You can upload multiple files
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Uploaded Files ({files.length})</h4>
              <p className="text-xs text-gray-500">Drag to reorder</p>
            </div>

            {files.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
              >
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    {file.isPrimary && (
                      <Badge variant="default" className="bg-blue-600">
                        <Star className="w-3 h-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!file.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrimary(file.id)}
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveFile(index, 'up')}
                      title="Move up"
                    >
                      ↑
                    </Button>
                  )}
                  
                  {index < files.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveFile(index, 'down')}
                      title="Move down"
                    >
                      ↓
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No documents uploaded yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
