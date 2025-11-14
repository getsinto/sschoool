'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, Video, CheckCircle, AlertCircle, Loader2, X, Play, Download } from 'lucide-react'

interface Recording {
  id: string
  filename: string
  size: number
  duration: number
  uploadedAt: string
  status: 'processing' | 'ready' | 'failed'
  url?: string
  thumbnailUrl?: string
}

interface RecordingUploaderProps {
  classId: string
  existingRecording?: Recording
  onUploadComplete?: (recording: Recording) => void
  autoFetchFromPlatform?: boolean
  platform?: 'zoom' | 'meet'
}

export default function RecordingUploader({ 
  classId, 
  existingRecording, 
  onUploadComplete,
  autoFetchFromPlatform = false,
  platform 
}: RecordingUploaderProps) {
  const [recording, setRecording] = useState<Recording | null>(existingRecording || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 60 / 60)
    const minutes = Math.floor((seconds / 60) % 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file')
      return
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size exceeds 2GB limit')
      return
    }

    setError('')
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // In real app, upload to server/cloud storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('classId', classId)

      const response = await fetch('/api/admin/live-classes/upload-recording', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setUploadProgress(100)

      const newRecording: Recording = {
        id: data.recordingId || `rec_${Date.now()}`,
        filename: file.name,
        size: file.size,
        duration: 3600, // Mock duration - would be extracted from video
        uploadedAt: new Date().toISOString(),
        status: 'processing',
        url: data.url
      }

      setRecording(newRecording)
      onUploadComplete?.(newRecording)

      // Simulate processing
      setTimeout(() => {
        setRecording(prev => prev ? { ...prev, status: 'ready' } : null)
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFetchFromPlatform = async () => {
    setIsFetching(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/live-classes/${classId}/fetch-recording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recording')
      }

      const data = await response.json()
      
      const fetchedRecording: Recording = {
        id: data.recordingId,
        filename: data.filename,
        size: data.size,
        duration: data.duration,
        uploadedAt: new Date().toISOString(),
        status: 'ready',
        url: data.url,
        thumbnailUrl: data.thumbnailUrl
      }

      setRecording(fetchedRecording)
      onUploadComplete?.(fetchedRecording)

    } catch (err: any) {
      setError(err.message || 'Failed to fetch recording')
    } finally {
      setIsFetching(false)
    }
  }

  const handleRemoveRecording = () => {
    setRecording(null)
    setUploadProgress(0)
    setError('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case 'ready':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="w-5 h-5" />
          <span>Class Recording</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recording ? (
          <>
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Recording
              </h3>
              <p className="text-gray-600 mb-4">
                Upload a video file or fetch from {platform === 'zoom' ? 'Zoom' : 'Google Meet'}
              </p>
              
              <div className="flex items-center justify-center space-x-3">
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                
                {autoFetchFromPlatform && platform && (
                  <Button 
                    variant="outline" 
                    onClick={handleFetchFromPlatform}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Fetch from {platform === 'zoom' ? 'Zoom' : 'Meet'}
                      </>
                    )}
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              <p className="text-xs text-gray-500 mt-4">
                Supported formats: MP4, MOV, AVI • Max size: 2GB
              </p>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Recording Info */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-32 h-20 bg-gray-200 rounded flex items-center justify-center">
                {recording.thumbnailUrl ? (
                  <img src={recording.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover rounded" />
                ) : (
                  <Video className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate">{recording.filename}</h4>
                  {getStatusBadge(recording.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-500">Size:</span> {formatFileSize(recording.size)}
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span> {formatDuration(recording.duration)}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Uploaded:</span> {new Date(recording.uploadedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveRecording}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Actions */}
            {recording.status === 'ready' && recording.url && (
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={recording.url} target="_blank" rel="noopener noreferrer">
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                  </a>
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm">
                  Publish to Course
                </Button>
              </div>
            )}

            {recording.status === 'processing' && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Loader2 className="w-4 h-4 text-yellow-600 animate-spin flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  Processing recording... This may take a few minutes.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
