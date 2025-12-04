'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Image as ImageIcon, Video, FileImage, Play } from 'lucide-react'
import { BannerUploader } from '@/components/common/BannerUploader'
import { ImageUploader } from './ImageUploader'
import { VideoManager } from './VideoManager'
import { DemoLessonSelector } from './DemoLessonSelector'
import { GalleryManager } from './GalleryManager'

interface MediaManagerProps {
  courseId: string
  existingMedia?: {
    thumbnail?: string
    banners?: {
      desktop?: string
      mobile?: string
      card?: string
      featured?: string
    }
    promoVideo?: {
      url: string
      thumbnail?: string
      title?: string
      description?: string
    }
    gallery?: any[]
    demoVideos?: any[]
  }
  onMediaUpdate?: (media: any) => void
}

export function MediaManager({
  courseId,
  existingMedia,
  onMediaUpdate
}: MediaManagerProps) {
  const [activeTab, setActiveTab] = useState('thumbnail')
  const [thumbnailUrl, setThumbnailUrl] = useState(existingMedia?.thumbnail)
  const [bannerUrls, setBannerUrls] = useState(existingMedia?.banners)

  const handleThumbnailUpload = async (url: string) => {
    setThumbnailUrl(url)
    
    // Update course in database
    try {
      const response = await fetch(`/api/courses/${courseId}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnail: url })
      })

      if (response.ok) {
        if (onMediaUpdate) {
          onMediaUpdate({ thumbnail: url })
        }
      }
    } catch (error) {
      console.error('Failed to update thumbnail:', error)
    }
  }

  const handleBannerUpload = async (urls: any) => {
    setBannerUrls(urls)
    
    // Update course in database
    try {
      const response = await fetch(`/api/courses/${courseId}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: urls })
      })

      if (response.ok) {
        if (onMediaUpdate) {
          onMediaUpdate({ banners: urls })
        }
      }
    } catch (error) {
      console.error('Failed to update banners:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Course Media</h2>
        <p className="text-gray-600 mt-1">
          Upload and manage all media for your course
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="thumbnail" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Thumbnail</span>
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            <span className="hidden sm:inline">Banners</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Promo Video</span>
          </TabsTrigger>
          <TabsTrigger value="demos" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Demo Lessons</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Gallery</span>
          </TabsTrigger>
        </TabsList>

        {/* Thumbnail Tab */}
        <TabsContent value="thumbnail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Thumbnail</CardTitle>
              <CardDescription>
                Main square image for course cards and listings (500x500px recommended)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Thumbnail uploader coming soon</p>
                <p className="text-sm mt-2">
                  Use the banner uploader for now, or upload directly in basic info
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-4">
          <BannerUploader
            courseId={courseId}
            onUploadComplete={handleBannerUpload}
            existingBanners={bannerUrls}
          />
        </TabsContent>

        {/* Promo Video Tab */}
        <TabsContent value="video" className="space-y-4">
          <VideoManager
            courseId={courseId}
            existingVideo={existingMedia?.promoVideo}
            onUploadComplete={async (video) => {
              // Update course in database
              try {
                const response = await fetch(`/api/courses/${courseId}/media`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ promoVideo: video })
                })

                if (response.ok && onMediaUpdate) {
                  onMediaUpdate({ promoVideo: video })
                }
              } catch (error) {
                console.error('Failed to update promo video:', error)
              }
            }}
          />
        </TabsContent>

        {/* Demo Lessons Tab */}
        <TabsContent value="demos" className="space-y-4">
          <DemoLessonSelector
            courseId={courseId}
            existingDemos={existingMedia?.demoVideos?.map(d => d.id) || []}
            onUpdate={(demoIds) => {
              if (onMediaUpdate) {
                onMediaUpdate({ demoLessonIds: demoIds })
              }
            }}
          />
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <GalleryManager
            courseId={courseId}
            existingImages={existingMedia?.gallery?.map(img => ({
              id: img.id,
              url: img.media_url,
              caption: img.caption || '',
              alt_text: img.alt_text || '',
              display_order: img.display_order
            })) || []}
            onUpdate={(images) => {
              if (onMediaUpdate) {
                onMediaUpdate({ gallery: images })
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
