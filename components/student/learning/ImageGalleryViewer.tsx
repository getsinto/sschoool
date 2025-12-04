'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Download, Maximize2, Grid3x3, List 
} from 'lucide-react'
import { ImageLessonContent, ImageLessonItem } from '@/types/lesson'

interface ImageGalleryViewerProps {
  content: ImageLessonContent
  onComplete?: () => void
  isCompleted?: boolean
}

export function ImageGalleryViewer({ 
  content, 
  onComplete,
  isCompleted = false 
}: ImageGalleryViewerProps) {
  const [selectedImage, setSelectedImage] = useState<ImageLessonItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    content.layout === 'carousel' ? 'grid' : (content.layout || 'grid')
  )
  const [zoomLevel, setZoomLevel] = useState(1)
  const [viewedImages, setViewedImages] = useState<Set<string>>(new Set())

  const images = content.images || []
  const allowZoom = content.allow_zoom ?? true
  const allowDownload = content.allow_download ?? false

  // Track viewed images
  const markImageAsViewed = (imageId: string) => {
    const newViewed = new Set(viewedImages)
    newViewed.add(imageId)
    setViewedImages(newViewed)

    // Auto-complete when all images viewed
    if (newViewed.size === images.length && !isCompleted && onComplete) {
      onComplete()
    }
  }

  // Open lightbox
  const openLightbox = (image: ImageLessonItem) => {
    setSelectedImage(image)
    setZoomLevel(1)
    markImageAsViewed(image.id)
  }

  // Close lightbox
  const closeLightbox = () => {
    setSelectedImage(null)
    setZoomLevel(1)
  }

  // Navigate in lightbox
  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!selectedImage) return

    const currentIndex = images.findIndex(img => img.id === selectedImage.id)
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0) newIndex = images.length - 1
    if (newIndex >= images.length) newIndex = 0

    const newImage = images[newIndex]
    setSelectedImage(newImage)
    setZoomLevel(1)
    markImageAsViewed(newImage.id)
  }

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  // Download image
  const downloadImage = (image: ImageLessonItem) => {
    if (!allowDownload) return

    const link = document.createElement('a')
    link.href = image.url
    link.download = image.title || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const viewedPercentage = (viewedImages.size / images.length) * 100

  return (
    <div className="space-y-4">
      {/* Gallery Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </span>
          <span className="text-sm text-gray-600">
            Viewed: {viewedImages.size}/{images.length} ({Math.round(viewedPercentage)}%)
          </span>
          {isCompleted && (
            <span className="text-sm text-green-600 font-medium">
              ✓ Completed
            </span>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${viewedPercentage}%` }}
        />
      </div>

      {/* Gallery Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              onClick={() => openLightbox(image)}
            >
              <img
                src={image.url}
                alt={image.alt_text || image.title || 'Image'}
                className="w-full h-64 object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Viewed Badge */}
              {viewedImages.has(image.id) && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  ✓ Viewed
                </div>
              )}

              {/* Caption */}
              {(image.title || image.caption) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  {image.title && (
                    <p className="text-white font-medium text-sm">{image.title}</p>
                  )}
                  {image.caption && (
                    <p className="text-white/80 text-xs mt-1">{image.caption}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="flex gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openLightbox(image)}
            >
              <img
                src={image.url}
                alt={image.alt_text || image.title || 'Image'}
                className="w-32 h-32 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    {image.title && (
                      <h3 className="font-medium text-lg">{image.title}</h3>
                    )}
                    {image.description && (
                      <p className="text-gray-600 text-sm mt-1">{image.description}</p>
                    )}
                    {image.caption && (
                      <p className="text-gray-500 text-xs mt-2 italic">{image.caption}</p>
                    )}
                  </div>
                  {viewedImages.has(image.id) && (
                    <span className="text-green-600 text-sm font-medium">✓ Viewed</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>{image.width} × {image.height}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openLightbox(image)
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    View Full Size
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateLightbox('prev')}
            className="absolute left-4 text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateLightbox('next')}
            className="absolute right-4 text-white hover:bg-white/20"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Zoom Controls */}
          {allowZoom && (
            <div className="absolute top-4 left-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoom(-0.25)}
                disabled={zoomLevel <= 0.5}
                className="text-white hover:bg-white/20"
              >
                <ZoomOut className="w-5 h-5" />
              </Button>
              <span className="text-white px-3 py-2 bg-black/50 rounded">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoom(0.25)}
                disabled={zoomLevel >= 3}
                className="text-white hover:bg-white/20"
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Download Button */}
          {allowDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadImage(selectedImage)}
              className="absolute bottom-20 right-4 text-white hover:bg-white/20"
            >
              <Download className="w-5 h-5 mr-2" />
              Download
            </Button>
          )}

          {/* Image */}
          <div className="max-w-7xl max-h-[80vh] overflow-auto">
            <img
              src={selectedImage.url}
              alt={selectedImage.alt_text || selectedImage.title || 'Image'}
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            {selectedImage.title && (
              <h3 className="text-white font-medium text-xl">{selectedImage.title}</h3>
            )}
            {selectedImage.description && (
              <p className="text-white/80 text-sm mt-2">{selectedImage.description}</p>
            )}
            {selectedImage.caption && (
              <p className="text-white/60 text-xs mt-2 italic">{selectedImage.caption}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
              <span>{selectedImage.width} × {selectedImage.height}</span>
              <span>
                Image {images.findIndex(img => img.id === selectedImage.id) + 1} of {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
