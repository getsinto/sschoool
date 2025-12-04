'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Upload, X, MoveUp, MoveDown, ZoomIn, Download } from 'lucide-react'
import { ImageLessonContent, ImageLessonItem } from '@/types/lesson'

interface ImageLessonGalleryProps {
  content?: ImageLessonContent
  onChange: (content: ImageLessonContent) => void
}

export function ImageLessonGallery({ content, onChange }: ImageLessonGalleryProps) {
  const [images, setImages] = useState<ImageLessonItem[]>(content?.images || [])
  const [layout, setLayout] = useState<'grid' | 'carousel' | 'masonry'>(content?.layout || 'grid')
  const [allowZoom, setAllowZoom] = useState(content?.allow_zoom ?? true)
  const [allowDownload, setAllowDownload] = useState(content?.allow_download ?? false)
  const [editingImage, setEditingImage] = useState<string | null>(null)

  const updateContent = (updatedImages: ImageLessonItem[]) => {
    setImages(updatedImages)
    onChange({
      images: updatedImages,
      layout,
      allow_zoom: allowZoom,
      allow_download: allowDownload
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue

      // Create preview URL
      const url = URL.createObjectURL(file)
      
      // Get image dimensions
      const img = new Image()
      img.src = url
      await new Promise((resolve) => {
        img.onload = resolve
      })

      const newImage: ImageLessonItem = {
        id: `img-${Date.now()}-${Math.random()}`,
        url,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        caption: '',
        alt_text: file.name,
        width: img.width,
        height: img.height,
        order_index: images.length
      }

      updateContent([...images, newImage])
    }

    // Reset input
    e.target.value = ''
  }

  const updateImage = (id: string, updates: Partial<ImageLessonItem>) => {
    const updatedImages = images.map(img =>
      img.id === id ? { ...img, ...updates } : img
    )
    updateContent(updatedImages)
  }

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id)
    // Reorder remaining images
    updatedImages.forEach((img, index) => {
      img.order_index = index
    })
    updateContent(updatedImages)
  }

  const moveImage = (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex(img => img.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const updatedImages = [...images]
    const [movedImage] = updatedImages.splice(index, 1)
    updatedImages.splice(newIndex, 0, movedImage)

    // Update order indices
    updatedImages.forEach((img, idx) => {
      img.order_index = idx
    })

    updateContent(updatedImages)
  }

  return (
    <div className="space-y-6">
      {/* Gallery Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
        <div>
          <Label>Gallery Layout</Label>
          <Select value={layout} onValueChange={(value: any) => {
            setLayout(value)
            onChange({ images, layout: value, allow_zoom: allowZoom, allow_download: allowDownload })
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid Layout</SelectItem>
              <SelectItem value="carousel">Carousel/Slider</SelectItem>
              <SelectItem value="masonry">Masonry Layout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              Allow Zoom
            </Label>
            <Switch
              checked={allowZoom}
              onCheckedChange={(checked) => {
                setAllowZoom(checked)
                onChange({ images, layout, allow_zoom: checked, allow_download: allowDownload })
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Allow Download
            </Label>
            <Switch
              checked={allowDownload}
              onCheckedChange={(checked) => {
                setAllowDownload(checked)
                onChange({ images, layout, allow_zoom: allowZoom, allow_download: checked })
              }}
            />
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div>
        <Label>Upload Images</Label>
        <div className="mt-2">
          <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Click to upload images or drag and drop
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supports: JPG, PNG, GIF, WebP. Max 10 images per lesson.
          </p>
        </div>
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-4">
          <Label>Images ({images.length}/10)</Label>
          
          <div className="space-y-3">
            {images.map((image, index) => (
              <div key={image.id} className="border rounded-lg p-4 bg-white">
                <div className="flex gap-4">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.alt_text || 'Preview'}
                      className="w-32 h-32 object-cover rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {image.width} × {image.height}
                    </p>
                  </div>

                  {/* Image Details */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={image.title || ''}
                        onChange={(e) => updateImage(image.id, { title: e.target.value })}
                        placeholder="Image title"
                        className="mt-1"
                      />
                    </div>

                    {editingImage === image.id ? (
                      <>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={image.description || ''}
                            onChange={(e) => updateImage(image.id, { description: e.target.value })}
                            placeholder="Detailed description"
                            rows={2}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Caption</Label>
                          <Input
                            value={image.caption || ''}
                            onChange={(e) => updateImage(image.id, { caption: e.target.value })}
                            placeholder="Short caption displayed below image"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Alt Text (for accessibility)</Label>
                          <Input
                            value={image.alt_text || ''}
                            onChange={(e) => updateImage(image.id, { alt_text: e.target.value })}
                            placeholder="Describe the image for screen readers"
                            className="mt-1"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingImage(null)}
                        >
                          Done Editing
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingImage(image.id)}
                      >
                        Edit Details
                      </Button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveImage(image.id, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveImage(image.id, 'down')}
                      disabled={index === images.length - 1}
                    >
                      <MoveDown className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(image.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No images uploaded yet. Click above to add images.</p>
        </div>
      )}
    </div>
  )
}
