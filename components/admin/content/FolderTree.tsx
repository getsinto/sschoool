'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Folder,
  FolderOpen,
  Video,
  FileText,
  Image,
  Music,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal
} from 'lucide-react'

interface Folder {
  id: string
  name: string
  parentId: string | null
  path: string
  type: 'videos' | 'documents' | 'images' | 'audio' | 'custom'
  fileCount: number
  totalSize: number
  createdAt: string
}

interface FolderTreeProps {
  folders: Folder[]
  currentFolder: string
  onFolderSelect: (folderId: string) => void
}

function FolderTree({ folders, currentFolder, onFolderSelect }: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const getFolderIcon = (type: string, isOpen: boolean) => {
    if (isOpen) {
      switch (type) {
        case 'videos': return <Video className="w-4 h-4 text-blue-600" />
        case 'documents': return <FileText className="w-4 h-4 text-green-600" />
        case 'images': return <Image className="w-4 h-4 text-purple-600" />
        case 'audio': return <Music className="w-4 h-4 text-orange-600" />
        default: return <FolderOpen className="w-4 h-4 text-gray-600" />
      }
    } else {
      return <Folder className="w-4 h-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
  }

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = currentFolder === folder.id
    const hasChildren = folders.some(f => f.parentId === folder.id)
    
    return (
      <div key={folder.id}>
        <div
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onFolderSelect(folder.id)}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(folder.id)
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            
            {getFolderIcon(folder.type, isSelected || isExpanded)}
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${isSelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                {folder.name}
              </p>
              {folder.fileCount > 0 && (
                <p className="text-xs text-gray-500">
                  {folder.fileCount} files • {formatFileSize(folder.totalSize)}
                </p>
              )}
            </div>
          </div>
          
          {folder.fileCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {folder.fileCount}
            </Badge>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {folders
              .filter(f => f.parentId === folder.id)
              .map(childFolder => renderFolder(childFolder, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Folders</CardTitle>
          <Button variant="ghost" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-1">
          {folders
            .filter(folder => folder.parentId === null)
            .map(folder => renderFolder(folder))}
        </div>
      </CardContent>
    </Card>
  )
}

export default FolderTree