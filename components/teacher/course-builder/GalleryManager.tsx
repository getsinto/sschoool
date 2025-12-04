'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, X, GripVertical, Image as ImageIcon, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { optimizeImage, validateImageFile, formatFileSize } from '@/lib/media/optimize'
import { uploadFile } from '@/lib/media/upload'

interface GalleryImage {
  id?: string
  url: string
  caption?: string
  alt_text?: string
  display_order: number
  file?: File
}

interface GalleryManagerProps {
  courseId: string
  existingImages?: GalleryImage[]
  onUpdate?: (images: GalleryImage[]) => void
  maxImages?: number
}

export function GalleryManager({
  courseId,
  existingImages = [],
  onUpdate,
  maxImages = 10
}: GalleryManagerProps) {
  const [images, setImages] = useState<GalleryImage[]>(existingImages)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check max images
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setIsUploading(true)
    setError(null)
    const newImages: GalleryImage[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file) continue

        // Validate
        const validation = validateImageFile(file, {
          maxSize: 5 * 1024 * 1024 // 5MB
        })

        if (!validation.valid) {
          setError(`${file.name}: ${validation.error}`)
          continue
        }

        // Optimize
        const optimized = await optimizeImage(file, {
          maxWidth: 1200,
          maxHeight: 900,
          quality: 85,
          format: 'webp'
        })

        // Upload
        const result = await uploadFile({
          bucket: 'courses',
          path: `courses/${courseId}/gallery/${Date.now()}-${i}.webp`,
          file: optimized,
          onProgress: (progress) => {
            setUploadProgress(((i + progress / 100) / files.length) * 100)
          }
        })

        if (result.success) {
          newImages.push({
            url: result.url!,
            display_order: images.length + newImages.length,
            caption: '',
            alt_text: file.name.replace(/\.[^/.]+$/, '')
          })
        }
      }

      // Add to state
      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)
      setSuccess(true)

      // Save to database
      await saveToDatabase(newImages)

      if (onUpdate) {
        onUpdate(updatedImages)
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const saveToDatabase = async (newImages: GalleryImage[]) => {
    for (const image of newImages) {
      try {
        await fetch(`/api/courses/${courseId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_type: 'image',
            media_url: image.url,
            caption: image.caption,
            alt_text: image.alt_text,
            display_order: image.display_order
          })
        })
      } catch (error) {
        console.error('Failed to save image to database:', error)
      }
    }
  }

  const handleRemove = async (index: number) => {
    const image = images[index]
    if (!image) return
    
    // Remove from database if it has an ID
    if (image.id) {
      try {
        await fetch(`/api/courses/${courseId}/media?mediaId=${image.id}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }

    // Remove from state
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)

    if (onUpdate) {
      onUpdate(updatedImages)
    }
  }

  const handleUpdateCaption = (index: number, caption: string) => {
    const updatedImages = [...images]
    const image = updatedImages[index]
    if (image) {
      image.caption = caption
      setImages(updatedImages)
    }
  }

  const handleUpdateAltText = (index: number, altText: string) => {
    const updatedImages = [...images]
    const image = updatedImages[index]
    if (image) {
      image.alt_text = altText
      setImages(updatedImages)
    }
  }

  const handleSaveMetadata = async (index: number) => {
    const image = images[index]
    if (!image) return
    
    if (image.id) {
      try {
        await fetch(`/api/courses/${courseId}/media/${image.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caption: image.caption,
            alt_text: image.alt_text
          })
        })
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } catch (error) {
        setError('Failed to save metadata')
      }
    }

    setEditingIndex(null)
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images]
    const [movedImage] = updatedImages.splice(fromIndex, 1)
    if (!movedImage) return
    updatedImages.splice(toIndex, 0, movedImage)

    // Update display orders
    updatedImages.forEach((img, idx) => {
      img.display_order = idx
    })

    setImages(updatedImages)

    if (onUpdate) {
      onUpdate(updatedImages)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="w-5 h-5 mr-2" />
          Image Gallery
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload up to {maxImages} images to showcase your course ({images.length}/{maxImages})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {images.length < maxImages && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="gallery-upload"
              disabled={isUploading}
            />
            <label htmlFor="gallery-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG or WebP (max 5MB each)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {maxImages - images.length} slots remaining
              </p>
            </label>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Uploading images...</span>
              <span className="text-gray-600">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">Images saved successfully!</p>
          </div>
        )}

        {/* Gallery Grid */}
        {images.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Gallery Images</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden bg-white"
                >
                  {/* Image */}
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.alt_text || `Gallery image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3 space-y-2">
                    {editingIndex === index ? (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Caption</Label>
                          <Input
                            placeholder="Image caption..."
                            value={image.caption || ''}
                            onChange={(e) => handleUpdateCaption(index, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Alt Text (for SEO)</Label>
                          <Input
                            placeholder="Describe the image..."
                            value={image.alt_text || ''}
                            onChange={(e) => handleUpdateAltText(index, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveMetadata(index)}
                            className="flex-1"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingIndex(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {image.caption && (
                          <p className="text-sm text-gray-700">{image.caption}</p>
                        )}
                        {image.alt_text && (
                          <p className="text-xs text-gray-500">Alt: {image.alt_text}</p>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingIndex(index)}
                          className="w-full"
                        >
                          Edit Details
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !isUploading && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No images uploaded yet</p>
            <p className="text-sm mt-1">Upload images to showcase your course content</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Add captions and alt text to improve SEO and accessibility. Images are automatically optimized to WebP format.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
