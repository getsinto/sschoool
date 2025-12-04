/**
 * Media Optimization Library
 * 
 * Handles image compression, format conversion, responsive image generation,
 * and video metadata extraction for course media.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ImageOptimizationOptions {
  quality?: number // 0-100, default 80
  maxWidth?: number
  maxHeight?: number
  format?: 'webp' | 'jpeg' | 'png'
  maintainAspectRatio?: boolean
}

export interface ResponsiveImageSizes {
  thumbnail: string // 150x150
  small: string // 400x300
  medium: string // 800x600
  large: string // 1200x900
  original: string
}

export interface VideoMetadata {
  duration: number // seconds
  width: number
  height: number
  size: number // bytes
  format: string
  bitrate?: number
}

export interface OptimizedImage {
  url: string
  width: number
  height: number
  size: number
  format: string
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

/**
 * Compress and optimize an image
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    quality = 80,
    maxWidth,
    maxHeight,
    format = 'webp',
    maintainAspectRatio = true
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      let { width, height } = img

      // Calculate new dimensions
      if (maxWidth || maxHeight) {
        if (maintainAspectRatio) {
          const aspectRatio = width / height

          if (maxWidth && width > maxWidth) {
            width = maxWidth
            height = width / aspectRatio
          }

          if (maxHeight && height > maxHeight) {
            height = maxHeight
            width = height * aspectRatio
          }
        } else {
          width = maxWidth || width
          height = maxHeight || height
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        `image/${format}`,
        quality / 100
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Generate multiple responsive sizes from an image
 */
export async function generateResponsiveSizes(
  file: File
): Promise<{ [key: string]: Blob }> {
  const sizes = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 }
  }

  const results: { [key: string]: Blob } = {}

  for (const [name, dimensions] of Object.entries(sizes)) {
    try {
      const optimized = await optimizeImage(file, {
        maxWidth: dimensions.width,
        maxHeight: dimensions.height,
        quality: 85,
        format: 'webp'
      })
      results[name] = optimized
    } catch (error) {
      console.error(`Failed to generate ${name} size:`, error)
    }
  }

  return results
}

/**
 * Crop image to specific aspect ratio
 */
export async function cropToAspectRatio(
  file: File,
  aspectRatio: number, // width / height (e.g., 16/9 = 1.778)
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      const imgAspectRatio = img.width / img.height
      let sourceX = 0
      let sourceY = 0
      let sourceWidth = img.width
      let sourceHeight = img.height

      // Calculate crop dimensions
      if (imgAspectRatio > aspectRatio) {
        // Image is wider than target
        sourceWidth = img.height * aspectRatio
        sourceX = (img.width - sourceWidth) / 2
      } else if (imgAspectRatio < aspectRatio) {
        // Image is taller than target
        sourceHeight = img.width / aspectRatio
        sourceY = (img.height - sourceHeight) / 2
      }

      // Set canvas size
      const maxWidth = options.maxWidth || sourceWidth
      const maxHeight = options.maxHeight || sourceHeight
      const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, 1)

      canvas.width = sourceWidth * scale
      canvas.height = sourceHeight * scale

      // Draw cropped image
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      )

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        `image/${options.format || 'webp'}`,
        (options.quality || 80) / 100
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// ============================================================================
// BANNER GENERATION
// ============================================================================

/**
 * Generate all required banner sizes from a single image
 */
export async function generateCourseBanners(file: File): Promise<{
  desktop: Blob
  mobile: Blob
  card: Blob
  featured: Blob
}> {
  const [desktop, mobile, card, featured] = await Promise.all([
    // Desktop banner: 1920x600 (3.2:1)
    cropToAspectRatio(file, 1920 / 600, {
      maxWidth: 1920,
      maxHeight: 600,
      quality: 85,
      format: 'webp'
    }),
    // Mobile banner: 800x400 (2:1)
    cropToAspectRatio(file, 800 / 400, {
      maxWidth: 800,
      maxHeight: 400,
      quality: 85,
      format: 'webp'
    }),
    // Card banner: 400x250 (1.6:1)
    cropToAspectRatio(file, 400 / 250, {
      maxWidth: 400,
      maxHeight: 250,
      quality: 85,
      format: 'webp'
    }),
    // Featured banner: 600x400 (1.5:1)
    cropToAspectRatio(file, 600 / 400, {
      maxWidth: 600,
      maxHeight: 400,
      quality: 85,
      format: 'webp'
    })
  ])

  return { desktop, mobile, card, featured }
}

// ============================================================================
// VIDEO UTILITIES
// ============================================================================

/**
 * Extract metadata from video file
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      resolve({
        duration: Math.round(video.duration),
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        format: file.type
      })
    }

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'))
    }

    video.src = URL.createObjectURL(file)
  })
}

/**
 * Generate thumbnail from video at specific time
 */
export async function generateVideoThumbnail(
  file: File,
  timeInSeconds: number = 0
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timeInSeconds, video.duration)
    }

    video.onseeked = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create thumbnail'))
          }
        },
        'image/webp',
        0.85
      )
    }

    video.onerror = () => {
      reject(new Error('Failed to load video'))
    }

    video.src = URL.createObjectURL(file)
  })
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  options: {
    maxSize?: number // bytes
    allowedFormats?: string[]
    minWidth?: number
    minHeight?: number
  } = {}
): FileValidationResult {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  } = options

  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed: ${allowedFormats.join(', ')}`
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`
    }
  }

  return { valid: true }
}

/**
 * Validate video file
 */
export function validateVideoFile(
  file: File,
  options: {
    maxSize?: number // bytes
    allowedFormats?: string[]
    maxDuration?: number // seconds
  } = {}
): FileValidationResult {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB default
    allowedFormats = ['video/mp4', 'video/webm', 'video/quicktime']
  } = options

  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid video format. Allowed: ${allowedFormats.join(', ')}`
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Video too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`
    }
  }

  return { valid: true }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get image dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(urls: { [size: string]: string }): string {
  const widths: { [key: string]: number } = {
    thumbnail: 150,
    small: 400,
    medium: 800,
    large: 1200
  }

  return Object.entries(urls)
    .filter(([size]) => widths[size])
    .map(([size, url]) => `${url} ${widths[size]}w`)
    .join(', ')
}
