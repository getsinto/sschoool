'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Upload, Link as LinkIcon, Play, X, Plus, Trash2 } from 'lucide-react'

interface VideoChapter {
  id: string
  timestamp: string
  title: string
}

interface VideoUploaderProps {
  value?: any
  onChange: (video: any) => void
}

export function VideoUploader({ value, onChange }: VideoUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [videoData, setVideoData] = useState(value || {
    type: 'upload', // 'upload' or 'embed'
    url: '',
    thumbnail: '',
    duration: '',
    settings: {
      allowSpeedControl: true,
      enableQuality: true,
      defaultStartPosition: 0,
      autoplay: false,
      controls: true
    },
    chapters: [] as VideoChapter[]
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload Tab
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file')
      return
    }

    // Validate file size (2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('File size must be less than 2GB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 500)

      // TODO: Actual upload to server
      // const formData = new FormData()
      // formData.append('video', file)
      // const response = await fetch('/api/teacher/courses/upload-video', {
      //   method: 'POST',
      //   body: formData
      // })

      // For now, create local URL
      const localUrl = URL.createObjectURL(file)
      
      const updated = {
        ...videoData,
        type: 'upload',
        url: localUrl,
        filename: file.name
      }
      
      setVideoData(updated)
      onChange(updated)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Embed Tab
  const [embedUrl, setEmbedUrl] = useState('')
  const [embedPlatform, setEmbedPlatform] = useState('youtube')

  const handleEmbedVideo = () => {
    if (!embedUrl) return

    const updated = {
      ...videoData,
      type: 'embed',
      url: embedUrl,
      platform: embedPlatform
    }

    setVideoData(updated)
    onChange(updated)
  }

  // Chapters
  const [newChapter, setNewChapter] = useState({ timestamp: '', title: '' })

  const addChapter = () => {
    if (!newChapter.timestamp || !newChapter.title) return

    const chapter: VideoChapter = {
      id: `chapter-${Date.now()}`,
      timestamp: newChapter.timestamp,
      title: newChapter.title
    }

    const updated = {
      ...videoData,
      chapters: [...videoData.chapters, chapter]
    }

    setVideoData(updated)
    onChange(updated)
    setNewChapter({ timestamp: '', title: '' })
  }

  const removeChapter = (id: string) => {
    const updated = {
      ...videoData,
      chapters: videoData.chapters.filter((c: VideoChapter) => c.id !== id)
    }
    setVideoData(updated)
    onChange(updated)
  }

  const updateSettings = (key: string, value: any) => {
    const updated = {
      ...videoData,
      settings: {
        ...videoData.settings,
        [key]: value
      }
    }
    setVideoData(updated)
    onChange(updated)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </TabsTrigger>
            <TabsTrigger value="embed">
              <LinkIcon className="w-4 h-4 mr-2" />
              Embed Video
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            {!videoData.url || videoData.type !== 'upload' ? (
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    MP4, MOV, AVI up to 2GB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoData.url}
                    controls
                    className="w-full h-full"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      const updated = { ...videoData, url: '', filename: '' }
                      setVideoData(updated)
                      onChange(updated)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  File: {videoData.filename}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-4">
            <div>
              <Label>Platform</Label>
              <Select value={embedPlatform} onValueChange={setEmbedPlatform}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                  <SelectItem value="google-drive">Google Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Video URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <Button onClick={handleEmbedVideo}>
                  <Play className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {videoData.url && videoData.type === 'embed' && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-600">
                  Embedded: {videoData.url}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Video Settings */}
        {videoData.url && (
          <div className="mt-6 space-y-6 pt-6 border-t">
            <h3 className="font-semibold">Video Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Speed Control</Label>
                  <p className="text-sm text-gray-500">0.5x, 1x, 1.5x, 2x</p>
                </div>
                <Switch
                  checked={videoData.settings.allowSpeedControl}
                  onCheckedChange={(checked) => updateSettings('allowSpeedControl', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Quality Options</Label>
                  <p className="text-sm text-gray-500">Allow quality selection</p>
                </div>
                <Switch
                  checked={videoData.settings.enableQuality}
                  onCheckedChange={(checked) => updateSettings('enableQuality', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Autoplay</Label>
                  <p className="text-sm text-gray-500">Start playing automatically</p>
                </div>
                <Switch
                  checked={videoData.settings.autoplay}
                  onCheckedChange={(checked) => updateSettings('autoplay', checked)}
                />
              </div>

              <div>
                <Label>Default Start Position (seconds)</Label>
                <Input
                  type="number"
                  value={videoData.settings.defaultStartPosition}
                  onChange={(e) => updateSettings('defaultStartPosition', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Chapters */}
            <div className="space-y-4">
              <h4 className="font-medium">Chapters (Optional)</h4>
              
              {videoData.chapters.length > 0 && (
                <div className="space-y-2">
                  {videoData.chapters.map((chapter: VideoChapter) => (
                    <div key={chapter.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-mono text-gray-600">{chapter.timestamp}</span>
                      <span className="flex-1 text-sm">{chapter.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChapter(chapter.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="00:00"
                  value={newChapter.timestamp}
                  onChange={(e) => setNewChapter({ ...newChapter, timestamp: e.target.value })}
                  className="w-24"
                />
                <Input
                  placeholder="Chapter title"
                  value={newChapter.title}
                  onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                  className="flex-1"
                />
                <Button
                  onClick={addChapter}
                  disabled={!newChapter.timestamp || !newChapter.title}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
