'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  recommendedSize?: string
  maxSize?: number // in MB
}

export function ImageUploader({
  value,
  onChange,
  label = 'Upload Image',
  recommendedSize = '1200x675px',
  maxSize = 5
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Create preview immediately for better UX
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'image')
      
      const response = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      
      // Update with server URL
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      console.error('Image upload error:', err)
      // Clear preview on error
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {recommendedSize && (
          <span className="text-xs text-gray-500">Recommended: {recommendedSize}</span>
        )}
      </div>

      {preview ? (
        <Card className="relative overflow-hidden">
          <div className="relative aspect-video w-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </Card>
      ) : (
        <Card
          className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxSize}MB
            </p>
          </div>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {uploading && (
        <p className="text-sm text-blue-600">Uploading...</p>
      )}
    </div>
  )
}
