'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FileUploader from '@/components/admin/content/FileUploader'
import FileGrid from '@/components/admin/content/FileGrid'
import FilePreview from '@/components/admin/content/FilePreview'
import FolderTree from '@/components/admin/content/FolderTree'
import { 
  Upload,
  Search,
  Grid3X3,
  List,
  Download,
  RefreshCw,
  FolderOpen,
  Image,
  Video,
  Music,
  FileText,
  HardDrive
} from 'lucide-react'

interface ContentFile {
  id: string
  name: string
  type: 'video' | 'document' | 'image' | 'audio'
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  folderId: string
  folderPath: string
  uploadedBy: {
    id: string
    name: string
  }
  uploadedAt: string
  lastModified: string
  metadata: {
    duration?: number
    dimensions?: { width: number; height: number }
    pages?: number
  }
  usageCount: number
  usedInCourses: string[]
  isPublic: boolean
  shareableLink?: string
  shareExpiry?: string
}

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

// Mock data
const mockFolders: Folder[] = [
  {
    id: 'root',
    name: 'Content Library',
    parentId: null,
    path: '/',
    type: 'custom',
    fileCount: 0,
    totalSize: 0,
    createdAt: '2024-01-01'
  },
  {
    id: 'videos',
    name: 'Videos',
    parentId: 'root',
    path: '/videos',
    type: 'videos',
    fileCount: 15,
    totalSize: 2500000000,
    createdAt: '2024-01-01'
  },
  {
    id: 'documents',
    name: 'Documents',
    parentId: 'root',
    path: '/documents',
    type: 'documents',
    fileCount: 8,
    totalSize: 45000000,
    createdAt: '2024-01-01'
  },
  {
    id: 'images',
    name: 'Images',
    parentId: 'root',
    path: '/images',
    type: 'images',
    fileCount: 23,
    totalSize: 120000000,
    createdAt: '2024-01-01'
  },
  {
    id: 'audio',
    name: 'Audio',
    parentId: 'root',
    path: '/audio',
    type: 'audio',
    fileCount: 5,
    totalSize: 85000000,
    createdAt: '2024-01-01'
  }
]

const mockFiles: ContentFile[] = [
  {
    id: '1',
    name: 'Introduction to Algebra.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    size: 156000000,
    url: '/content/videos/intro-algebra.mp4',
    thumbnailUrl: '/api/placeholder/300/200',
    folderId: 'videos',
    folderPath: '/videos',
    uploadedBy: { id: 'u1', name: 'Dr. Sarah Johnson' },
    uploadedAt: '2024-01-15T10:30:00Z',
    lastModified: '2024-01-15T10:30:00Z',
    metadata: {
      duration: 1245,
      dimensions: { width: 1920, height: 1080 }
    },
    usageCount: 3,
    usedInCourses: ['Math Grade 10', 'Algebra Basics'],
    isPublic: false
  },
  {
    id: '2',
    name: 'Course Syllabus.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    size: 2500000,
    url: '/content/documents/syllabus.pdf',
    folderId: 'documents',
    folderPath: '/documents',
    uploadedBy: { id: 'u2', name: 'Prof. Michael Brown' },
    uploadedAt: '2024-01-12T14:20:00Z',
    lastModified: '2024-01-18T09:15:00Z',
    metadata: {
      pages: 12
    },
    usageCount: 8,
    usedInCourses: ['English Literature', 'Writing Skills'],
    isPublic: true,
    shareableLink: 'https://example.com/share/abc123',
    shareExpiry: '2024-02-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Math Formula Chart.png',
    type: 'image',
    mimeType: 'image/png',
    size: 850000,
    url: '/content/images/formula-chart.png',
    thumbnailUrl: '/api/placeholder/300/200',
    folderId: 'images',
    folderPath: '/images',
    uploadedBy: { id: 'u1', name: 'Dr. Sarah Johnson' },
    uploadedAt: '2024-01-10T16:45:00Z',
    lastModified: '2024-01-10T16:45:00Z',
    metadata: {
      dimensions: { width: 2048, height: 1536 }
    },
    usageCount: 12,
    usedInCourses: ['Math Grade 10', 'Math Grade 11', 'SAT Prep'],
    isPublic: false
  }
]

export default function ContentLibraryPage() {
  const [files, setFiles] = useState<ContentFile[]>(mockFiles)
  const [folders] = useState<Folder[]>(mockFolders)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>('root')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterType, setFilterType] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')
  const [filterUploadedBy] = useState('all')
  const [showUploader, setShowUploader] = useState(false)
  const [previewFile, setPreviewFile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filter and sort files
  const filteredFiles = files.filter(file => {
    // Folder filter
    if (currentFolder !== 'root' && file.folderId !== currentFolder) {
      return false
    }

    // Search filter
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Type filter
    if (filterType !== 'all' && file.type !== filterType) {
      return false
    }

    // Uploaded by filter
    if (filterUploadedBy !== 'all' && file.uploadedBy.id !== filterUploadedBy) {
      return false
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const uploadDate = new Date(file.uploadedAt)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (filterDateRange) {
        case 'today':
          return daysDiff === 0
        case 'week':
          return daysDiff <= 7
        case 'month':
          return daysDiff <= 30
        case 'year':
          return daysDiff <= 365
        default:
          return true
      }
    }

    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'date':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      case 'size':
        return b.size - a.size
      case 'type':
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })

  const handleBulkAction = (action: string) => {
    if (selectedFiles.length === 0) return
    console.log(`Bulk ${action}:`, selectedFiles)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStorageStats = () => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const typeStats = {
      videos: files.filter(f => f.type === 'video').reduce((sum, f) => sum + f.size, 0),
      documents: files.filter(f => f.type === 'document').reduce((sum, f) => sum + f.size, 0),
      images: files.filter(f => f.type === 'image').reduce((sum, f) => sum + f.size, 0),
      audio: files.filter(f => f.type === 'audio').reduce((sum, f) => sum + f.size, 0)
    }
    
    return { totalSize, typeStats }
  }

  const { totalSize, typeStats } = getStorageStats()
  const currentFolderData = folders.find(f => f.id === currentFolder)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
          <p className="text-gray-600 mt-1">
            Manage your course content, media files, and documents
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedFiles.length > 0 && (
            <>
              <Button variant="outline" onClick={() => handleBulkAction('download')}>
                <Download className="w-4 h-4 mr-2" />
                Download ({selectedFiles.length})
              </Button>
              <Button variant="outline" onClick={() => handleBulkAction('delete')}>
                Delete ({selectedFiles.length})
              </Button>
            </>
          )}
          <Button onClick={() => setShowUploader(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Storage</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
              </div>
              <HardDrive className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Videos</p>
                <p className="text-2xl font-bold text-blue-600">{formatFileSize(typeStats.videos)}</p>
              </div>
              <Video className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-green-600">{formatFileSize(typeStats.documents)}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold text-purple-600">{formatFileSize(typeStats.images)}</p>
              </div>
              <Image className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audio</p>
                <p className="text-2xl font-bold text-orange-600">{formatFileSize(typeStats.audio)}</p>
              </div>
              <Music className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder Tree Sidebar */}
        <div className="lg:col-span-1">
          <FolderTree
            folders={folders}
            currentFolder={currentFolder}
            onFolderSelect={setCurrentFolder}
          />
        </div>

        {/* File Browser */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5 text-gray-500" />
                  <CardTitle>
                    {currentFolderData?.name || 'Content Library'} ({filteredFiles.length} files)
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {/* View Toggle */}
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="File Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Grid/List */}
              <FileGrid
                files={filteredFiles}
                viewMode={viewMode}
                selectedFiles={selectedFiles}
                onSelectionChange={setSelectedFiles}
                onFilePreview={setPreviewFile}
                isLoading={isLoading}
                currentFolder={currentFolder}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* File Uploader Modal */}
      {showUploader && (
        <FileUploader
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          currentFolder={currentFolder}
          onUploadComplete={(newFiles: ContentFile[]) => {
            setFiles([...files, ...newFiles])
            setShowUploader(false)
          }}
        />
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview
          file={{
            ...previewFile,
            folder: previewFile.folderPath || '/',
            uploadedBy: typeof previewFile.uploadedBy === 'string' 
              ? previewFile.uploadedBy 
              : previewFile.uploadedBy.name,
            duration: previewFile.metadata?.duration,
            dimensions: previewFile.metadata?.dimensions
          }}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          onUpdate={(updatedFile: any) => {
            const updated = {
              ...previewFile,
              ...updatedFile,
              uploadedBy: previewFile.uploadedBy,
              folderPath: updatedFile.folder
            }
            setFiles(files.map(f => f.id === updated.id ? updated : f))
            setPreviewFile(updated)
          }}
          onDelete={(fileId: string) => {
            setFiles(files.filter(f => f.id !== fileId))
            setPreviewFile(null)
          }}
        />
      )}
    </div>
  )
}