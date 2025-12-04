'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { generateCourseBanners } from '@/lib/media/optimize'
import { uploadCourseBanners } from '@/lib/media/upload'
import { validateImageFile, formatFileSize } from '@/lib/media/optimize'

interface BannerUploaderProps {
  courseId: string
  onUploadComplete?: (urls: {
    desktop?: string
    mobile?: string
    card?: string
    featured?: string
  }) => void
  existingBanners?: {
    desktop?: string
    mobile?: string
    card?: string
    featured?: string
  }
}

interface BannerPreview {
  desktop?: string
  mobile?: string
  card?: string
  featured?: string
}

export function BannerUploader({
  courseId,
  onUploadComplete,
  existingBanners
}: BannerUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previews, setPreviews] = useState<BannerPreview>(existingBanners || {})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
    })

    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setSelectedFile(file)
    setError(null)
    setSuccess(false)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      // Generate all banner sizes
      const banners = await generateCourseBanners(selectedFile)

      // Create preview URLs
      const newPreviews: BannerPreview = {
        desktop: URL.createObjectURL(banners.desktop),
        mobile: URL.createObjectURL(banners.mobile),
        card: URL.createObjectURL(banners.card),
        featured: URL.createObjectURL(banners.featured)
      }

      setPreviews(newPreviews)
      setProgress(50)

      // Upload to storage
      setIsUploading(true)
      const result = await uploadCourseBanners(
        courseId,
        banners,
        (uploadProgress) => {
          setProgress(50 + (uploadProgress / 2))
        }
      )

      if (result.errors && result.errors.length > 0) {
        setError(`Upload errors: ${result.errors.join(', ')}`)
      } else {
        setSuccess(true)
        if (onUploadComplete) {
          onUploadComplete({
            desktop: result.desktop,
            mobile: result.mobile,
            card: result.card,
            featured: result.featured
          })
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process banners')
    } finally {
      setIsProcessing(false)
      setIsUploading(false)
      setProgress(100)
    }
  }, [selectedFile, courseId, onUploadComplete])

  const handleRemove = useCallback(() => {
    setSelectedFile(null)
    setPreviews({})
    setError(null)
    setSuccess(false)
    setProgress(0)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="w-5 h-5 mr-2" />
          Course Banners
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload one image and we'll automatically generate all banner sizes
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        {!selectedFile && !previews.desktop && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="banner-upload"
            />
            <label htmlFor="banner-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG or WebP (max 5MB)
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Recommended: 1920x1080px or larger
              </p>
            </label>
          </div>
        )}

        {/* Selected File Info */}
        {selectedFile && !previews.desktop && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ImageIcon className="w-8 h-8 text-blue-600" />
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

            <div className="mt-4 space-y-2">
              <Button
                onClick={handleGenerate}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Generate All Banners'}
              </Button>
              <p className="text-xs text-gray-600 text-center">
                This will create 4 optimized banner sizes
              </p>
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {(isProcessing || isUploading) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {isProcessing && !isUploading && 'Processing images...'}
                {isUploading && 'Uploading...'}
              </span>
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
              Banners uploaded successfully!
            </p>
          </div>
        )}

        {/* Banner Previews */}
        {previews.desktop && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Preview</h4>

            {/* Desktop Banner */}
            <div>
              <p className="text-xs text-gray-600 mb-2">
                Desktop Banner (1920x600px)
              </p>
              <div className="relative aspect-[1920/600] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previews.desktop}
                  alt="Desktop banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Mobile Banner */}
            <div>
              <p className="text-xs text-gray-600 mb-2">
                Mobile Banner (800x400px)
              </p>
              <div className="relative aspect-[800/400] bg-gray-100 rounded-lg overflow-hidden max-w-md">
                <img
                  src={previews.mobile}
                  alt="Mobile banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card & Featured Banners */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-2">
                  Card Banner (400x250px)
                </p>
                <div className="relative aspect-[400/250] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previews.card}
                    alt="Card banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-2">
                  Featured Banner (600x400px)
                </p>
                <div className="relative aspect-[600/400] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previews.featured}
                    alt="Featured banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Replace Button */}
            {!isProcessing && !isUploading && (
              <Button
                variant="outline"
                onClick={handleRemove}
                className="w-full"
              >
                Upload Different Image
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
