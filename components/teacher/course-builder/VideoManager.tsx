'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Check, AlertCircle, Video, Youtube, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { validateVideoFile, formatFileSize, extractVideoMetadata } from '@/lib/media/optimize'
import { uploadFile } from '@/lib/media/upload'

interface VideoManagerProps {
  courseId: string
  onUploadComplete?: (video: {
    url: string
    thumbnail?: string
    title?: string
    description?: string
    duration?: number
    provider: 'upload' | 'youtube' | 'vimeo' | 'wistia' | 'google_drive'
  }) => void
  existingVideo?: {
    url: string
    thumbnail?: string
    title?: string
    description?: string
    provider?: string
  }
}

export function VideoManager({
  courseId,
  onUploadComplete,
  existingVideo
}: VideoManagerProps) {
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'embed'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [embedUrl, setEmbedUrl] = useState(existingVideo?.url || '')
  const [videoTitle, setVideoTitle] = useState(existingVideo?.title || '')
  const [videoDescription, setVideoDescription] = useState(existingVideo?.description || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingVideo?.url || null)

  const detectProvider = (url: string): 'youtube' | 'vimeo' | 'wistia' | 'google_drive' | 'upload' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('vimeo.com')) return 'vimeo'
    if (url.includes('wistia.com')) return 'wistia'
    if (url.includes('drive.google.com')) return 'google_drive'
    return 'upload'
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateVideoFile(file, {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedFormats: ['video/mp4', 'video/webm', 'video/quicktime']
    })

    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError(null)
    setSuccess(false)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      // Extract video metadata
      const metadata = await extractVideoMetadata(selectedFile)

      // Upload video
      const result = await uploadFile({
        bucket: 'courses',
        path: `courses/${courseId}/videos/promo-${Date.now()}.${selectedFile.name.split('.').pop()}`,
        file: selectedFile,
        onProgress: (p) => setProgress(p)
      })

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      setSuccess(true)
      if (onUploadComplete) {
        onUploadComplete({
          url: result.url!,
          title: videoTitle,
          description: videoDescription,
          duration: metadata.duration,
          provider: 'upload'
        })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload video')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedFile, courseId, videoTitle, videoDescription, onUploadComplete])

  const handleEmbedSave = useCallback(() => {
    if (!embedUrl) {
      setError('Please enter a video URL')
      return
    }

    const provider = detectProvider(embedUrl)
    
    if (onUploadComplete) {
      onUploadComplete({
        url: embedUrl,
        title: videoTitle,
        description: videoDescription,
        provider
      })
    }

    setSuccess(true)
  }, [embedUrl, videoTitle, videoDescription, onUploadComplete])

  const handleRemove = useCallback(() => {
    setSelectedFile(null)
    setEmbedUrl('')
    setPreviewUrl(null)
    setError(null)
    setSuccess(false)
    setProgress(0)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="w-5 h-5 mr-2" />
          Promotional Video
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload a video or embed from YouTube/Vimeo
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Method Tabs */}
        <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Video
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Embed URL
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            {!selectedFile && !previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    MP4, WebM or MOV (max 100MB)
                  </p>
                </label>
              </div>
            )}

            {selectedFile && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Video className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {previewUrl && (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            )}
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="embed-url">Video URL</Label>
              <Input
                id="embed-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Supports YouTube, Vimeo, Wistia, and Google Drive
              </p>
            </div>

            {embedUrl && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <Youtube className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Video Details */}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="video-title">Video Title (Optional)</Label>
            <Input
              id="video-title"
              placeholder="e.g., Course Introduction"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-description">Video Description (Optional)</Label>
            <Textarea
              id="video-description"
              placeholder="Describe what students will learn from this video..."
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Uploading video...</span>
              <span className="text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Upload Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">
              Video saved successfully!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {uploadMethod === 'upload' && selectedFile && !success && (
            <Button
              onClick={handleUpload}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Uploading...' : 'Upload Video'}
            </Button>
          )}

          {uploadMethod === 'embed' && embedUrl && !success && (
            <Button
              onClick={handleEmbedSave}
              className="flex-1"
            >
              Save Video
            </Button>
          )}

          {(selectedFile || embedUrl) && (
            <Button
              variant="outline"
              onClick={handleRemove}
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
