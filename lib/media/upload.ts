/**
 * Media Upload Utilities
 * 
 * Handles file uploads to Supabase storage with progress tracking,
 * chunked uploads, and error handling.
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export interface UploadOptions {
  bucket: string
  path: string
  file: File | Blob
  onProgress?: (progress: number) => void
  contentType?: string
  cacheControl?: string
  upsert?: boolean
}

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface MultiUploadResult {
  successful: UploadResult[]
  failed: UploadResult[]
}

// ============================================================================
// STORAGE PATH HELPERS
// ============================================================================

/**
 * Generate storage path for course media
 */
export function getCourseMediaPath(
  courseId: string,
  mediaType: 'thumbnail' | 'banner' | 'video' | 'demo' | 'gallery',
  filename: string
): string {
  const timestamp = Date.now()
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `courses/${courseId}/${mediaType}/${timestamp}-${sanitized}`
}

/**
 * Generate banner paths for all sizes
 */
export function getBannerPaths(courseId: string): {
  desktop: string
  mobile: string
  card: string
  featured: string
} {
  return {
    desktop: `courses/${courseId}/banners/desktop.webp`,
    mobile: `courses/${courseId}/banners/mobile.webp`,
    card: `courses/${courseId}/banners/card.webp`,
    featured: `courses/${courseId}/banners/featured.webp`
  }
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload a single file to Supabase storage
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const {
    bucket,
    path,
    file,
    onProgress,
    contentType,
    cacheControl = '3600',
    upsert = false
  } = options

  try {
    const supabase = createClient()

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: contentType || file.type,
        cacheControl,
        upsert
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    if (onProgress) {
      onProgress(100)
    }

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error: any) {
    console.error('Upload exception:', error)
    return {
      success: false,
      error: error.message || 'Upload failed'
    }
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: Array<Omit<UploadOptions, 'onProgress'>>,
  onProgress?: (completed: number, total: number) => void
): Promise<MultiUploadResult> {
  const results: UploadResult[] = []
  let completed = 0

  for (const fileOptions of files) {
    const result = await uploadFile(fileOptions)
    results.push(result)
    completed++

    if (onProgress) {
      onProgress(completed, files.length)
    }
  }

  return {
    successful: results.filter(r => r.success),
    failed: results.filter(r => !r.success)
  }
}

/**
 * Upload course banners (all sizes)
 */
export async function uploadCourseBanners(
  courseId: string,
  banners: {
    desktop: Blob
    mobile: Blob
    card: Blob
    featured: Blob
  },
  onProgress?: (progress: number) => void
): Promise<{
  desktop?: string
  mobile?: string
  card?: string
  featured?: string
  errors?: string[]
}> {
  const paths = getBannerPaths(courseId)
  const errors: string[] = []
  const urls: any = {}

  let completed = 0
  const total = 4

  // Upload desktop banner
  const desktopResult = await uploadFile({
    bucket: 'courses',
    path: paths.desktop,
    file: banners.desktop,
    contentType: 'image/webp',
    upsert: true
  })

  if (desktopResult.success) {
    urls.desktop = desktopResult.url
  } else {
    errors.push(`Desktop banner: ${desktopResult.error}`)
  }

  completed++
  if (onProgress) onProgress((completed / total) * 100)

  // Upload mobile banner
  const mobileResult = await uploadFile({
    bucket: 'courses',
    path: paths.mobile,
    file: banners.mobile,
    contentType: 'image/webp',
    upsert: true
  })

  if (mobileResult.success) {
    urls.mobile = mobileResult.url
  } else {
    errors.push(`Mobile banner: ${mobileResult.error}`)
  }

  completed++
  if (onProgress) onProgress((completed / total) * 100)

  // Upload card banner
  const cardResult = await uploadFile({
    bucket: 'courses',
    path: paths.card,
    file: banners.card,
    contentType: 'image/webp',
    upsert: true
  })

  if (cardResult.success) {
    urls.card = cardResult.url
  } else {
    errors.push(`Card banner: ${cardResult.error}`)
  }

  completed++
  if (onProgress) onProgress((completed / total) * 100)

  // Upload featured banner
  const featuredResult = await uploadFile({
    bucket: 'courses',
    path: paths.featured,
    file: banners.featured,
    contentType: 'image/webp',
    upsert: true
  })

  if (featuredResult.success) {
    urls.featured = featuredResult.url
  } else {
    errors.push(`Featured banner: ${featuredResult.error}`)
  }

  completed++
  if (onProgress) onProgress((completed / total) * 100)

  return {
    ...urls,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Delete failed'
    }
  }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(
  bucket: string,
  paths: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Delete failed'
    }
  }
}

/**
 * Check if file exists in storage
 */
export async function fileExists(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'))

    if (error) return false

    const filename = path.split('/').pop()
    return data?.some(file => file.name === filename) || false
  } catch {
    return false
  }
}

/**
 * Get file URL from storage
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get signed URL for private files
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Exception creating signed URL:', error)
    return null
  }
}

// ============================================================================
// CHUNKED UPLOAD (for large files)
// ============================================================================

/**
 * Upload large file in chunks
 * Note: Supabase doesn't natively support chunked uploads,
 * so this is a placeholder for future implementation
 */
export async function uploadLargeFile(
  options: UploadOptions & { chunkSize?: number }
): Promise<UploadResult> {
  // For now, use regular upload
  // In production, you might want to implement chunked upload
  // using a custom backend endpoint
  return uploadFile(options)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract filename from path
 */
export function getFilenameFromPath(path: string): string {
  return path.split('/').pop() || ''
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = getFileExtension(originalFilename)
  const nameWithoutExt = originalFilename.replace(`.${ext}`, '')
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9-]/g, '_')
  
  return `${sanitized}-${timestamp}-${random}.${ext}`
}
