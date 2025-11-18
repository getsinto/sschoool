'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, Link as LinkIcon, Play } from 'lucide-react'

interface VideoInputProps {
  value?: { type: 'upload' | 'url'; value: string }
  onChange: (video: { type: 'upload' | 'url'; value: string }) => void
}

export function VideoInput({ value, onChange }: VideoInputProps) {
  const [url, setUrl] = useState(value?.type === 'url' ? value.value : '')
  const [uploading, setUploading] = useState(false)

  const handleUrlSubmit = () => {
    if (url) {
      onChange({ type: 'url', value: url })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // TODO: Implement actual upload
      // For now, create a local URL
      const localUrl = URL.createObjectURL(file)
      onChange({ type: 'upload', value: localUrl })
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Intro Video (Optional)</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <LinkIcon className="w-4 h-4 mr-2" />
              Video URL
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div>
              <Label>YouTube or Vimeo URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button onClick={handleUrlSubmit}>
                  <Play className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Paste a YouTube or Vimeo video URL
              </p>
            </div>

            {value?.type === 'url' && value.value && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-600">Video: {value.value}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label>Upload Video File</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                MP4, MOV, AVI up to 2GB
              </p>
            </div>

            {uploading && (
              <p className="text-sm text-blue-600">Uploading...</p>
            )}

            {value?.type === 'upload' && value.value && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <video src={value.value} controls className="w-full h-full" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
