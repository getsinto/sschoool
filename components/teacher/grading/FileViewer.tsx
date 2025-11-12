'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, FileText, Image as ImageIcon, File } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  size: string
  type: string
  url: string
}

interface FileViewerProps {
  files: FileItem[]
  onDownload?: (fileId: string) => void
  onPreview?: (fileId: string) => void
}

export default function FileViewer({ files, onDownload, onPreview }: FileViewerProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-600" />
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
      return <ImageIcon className="w-8 h-8 text-blue-600" />
    }
    return <File className="w-8 h-8 text-gray-600" />
  }

  const getFileTypeColor = (type: string) => {
    if (type.includes('pdf')) return 'bg-red-100 text-red-800'
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
      return 'bg-blue-100 text-blue-800'
    }
    if (['doc', 'docx'].includes(type)) return 'bg-blue-100 text-blue-800'
    if (['xls', 'xlsx'].includes(type)) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className={`border rounded-lg p-4 transition-colors ${
              selectedFile?.id === file.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">{file.size}</span>
                    <Badge className={getFileTypeColor(file.type)} variant="outline">
                      {file.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(file)
                    onPreview?.(file.id)
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload?.(file.id)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}

        {files.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No files submitted</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
