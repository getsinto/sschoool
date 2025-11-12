'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  X, 
  Download, 
  Share2, 
  Edit, 
  Trash2, 
  Copy,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  ExternalLink
} from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'video' | 'image' | 'document' | 'audio'
  size: number
  url: string
  thumbnail?: string
  duration?: number
  dimensions?: { width: number; height: number }
  uploadedBy: string
  uploadedAt: string
  folder: string
  usedInCourses?: string[]
  metadata?: {
    title?: string
    description?: string
    tags?: string[]
  }
}

interface FilePreviewProps {
  file: FileItem
  isOpen: boolean
  onClose: () => void
  onUpdate: (file: FileItem) => void
  onDelete: (fileId: string) => void
}

export default function FilePreview({ file, isOpen, onClose, onUpdate, onDelete }: FilePreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedFile, setEditedFile] = useState(file)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    setEditedFile(file)
    setZoom(100)
    setRotation(0)
  }, [file])

  if (!isOpen) return null

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = () => {
    onUpdate(editedFile)
    setIsEditing(false)
  }

  const handlePlayPause = () => {
    if (file.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (file.type === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    setIsMuted(!isMuted)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    // Generate shareable link with expiry
    const shareableLink = `${window.location.origin}/shared/${file.id}?expires=${Date.now() + 7 * 24 * 60 * 60 * 1000}`
    
    try {
      await navigator.clipboard.writeText(shareableLink)
      // Show toast notification
      console.log('Link copied to clipboard')
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const renderPreview = () => {
    switch (file.type) {
      case 'video':
        return (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={file.url}
              className="w-full h-auto max-h-96"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1 flex items-center space-x-2 text-white text-sm">
                  <span>{formatDuration(currentTime)}</span>
                  <div className="flex-1 bg-white/30 rounded-full h-1">
                    <div 
                      className="bg-white rounded-full h-1 transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <span>{formatDuration(duration)}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <div className="flex items-center justify-center min-h-64">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-96 object-contain transition-transform"
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)` 
                }}
              />
            </div>
            
            {/* Image Controls */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setZoom(Math.min(zoom + 25, 200))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setZoom(Math.max(zoom - 25, 25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRotation((rotation + 90) % 360)}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {zoom}% • {file.dimensions?.width}×{file.dimensions?.height}
            </div>
          </div>
        )

      case 'audio':
        return (
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-8">
            <div className="text-center">
              <Music className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
              
              <audio
                ref={audioRef}
                src={file.url}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              <div className="flex items-center justify-center space-x-4 mt-6">
                <Button onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                
                <Button variant="outline" onClick={handleMute}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 text-sm text-gray-600">
                <span>{formatDuration(currentTime)}</span>
                <div className="flex-1 bg-gray-300 rounded-full h-2 max-w-xs">
                  <div 
                    className="bg-purple-600 rounded-full h-2 transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
          </div>
        )

      case 'document':
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
            <p className="text-gray-600 mb-6">
              {formatFileSize(file.size)} • {file.type.toUpperCase()}
            </p>
            
            <div className="space-y-3">
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Preview not available for this file type</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className="truncate">{file.name}</CardTitle>
            <Badge variant="outline" className="capitalize">
              {file.type}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(file.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview Area */}
            <div className="lg:col-span-2">
              {renderPreview()}
            </div>
            
            {/* File Info & Edit Panel */}
            <div className="space-y-6">
              {/* File Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <p className="font-medium">{formatFileSize(file.size)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <p className="font-medium capitalize">{file.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Uploaded:</span>
                      <p className="font-medium">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">By:</span>
                      <p className="font-medium">{file.uploadedBy}</p>
                    </div>
                    {file.duration && (
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">{formatDuration(file.duration)}</p>
                      </div>
                    )}
                    {file.dimensions && (
                      <div>
                        <span className="text-gray-600">Dimensions:</span>
                        <p className="font-medium">{file.dimensions.width}×{file.dimensions.height}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Edit Form */}
              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Edit File</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        File Name
                      </label>
                      <Input
                        value={editedFile.name}
                        onChange={(e) => setEditedFile({ ...editedFile, name: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Title
                      </label>
                      <Input
                        value={editedFile.metadata?.title || ''}
                        onChange={(e) => setEditedFile({ 
                          ...editedFile, 
                          metadata: { ...editedFile.metadata, title: e.target.value }
                        })}
                        placeholder="Display title"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description
                      </label>
                      <Textarea
                        value={editedFile.metadata?.description || ''}
                        onChange={(e) => setEditedFile({ 
                          ...editedFile, 
                          metadata: { ...editedFile.metadata, description: e.target.value }
                        })}
                        placeholder="File description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button onClick={handleSave}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Usage Info */}
              {file.usedInCourses && file.usedInCourses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Used In Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {file.usedInCourses.map((course, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{course}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}