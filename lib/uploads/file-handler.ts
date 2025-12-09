/**
 * File Upload Service Library
 * 
 * Handles file validation, upload to Supabase Storage, processing,
 * and cleanup for all file types (images, videos, documents).
 * 
 * Requirements: 3.1-3.12
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

export interface UploadResult {
  success: boolean
  fileId?: string
  publicUrl?: string
  metadata?: FileMetadata
  error?: string
}

export interface FileMetadata {
  filename: string
  fileType: string
  fileSize: number
  bucket: string
  path: string
  width?: number
  height?: number
  duration?: number
  pageCount?: number
  wordCount?: number
  thumbnail?: string
  variants?: ImageVariants
}

export interface ImageVariants {
  thumbnail: string
  medium: string
  large: string
  original: string
}

export interface VideoMetadata {
  duration: number
  width: number
  height: number
  thumbnail: string
  format: string
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const FILE_TYPE_CONFIG = {
  images: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 10 * 1024 * 1024, // 10MB
    bucket: 'course-images'
  },
  videos: {
    extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
    maxSize: 500 * 1024 * 1024, // 500MB
    bucket: 'course-videos'
  },
  documents: {
    extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    bucket: 'course-documents'
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate file type against allowed extensions
 * Requirement: 3.1
 */
export function validateFileType(file: File, fileType?: 'image' | 'video' | 'document'): ValidationResult {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (!extension) {
    return {
      valid: false,
      error: 'File has no extension'
    }
  }

  // If fileType is specified, validate against that category only
  if (fileType) {
    const categoryKey = fileType === 'image' ? 'images' : fileType === 'video' ? 'videos' : 'documents'
    const config = FILE_TYPE_CONFIG[categoryKey]
    
    if (!config.extensions.includes(extension)) {
      return {
        valid: false,
        error: `File type .${extension} is not allowed for ${fileType}s. Allowed types: ${config.extensions.join(', ')}`
      }
    }
    
    if (!config.mimeTypes.includes(file.type)) {
      return {
        valid: true,
        warnings: [`MIME type ${file.type} doesn't match extension .${extension}`]
      }
    }
    
    return { valid: true }
  }

  // Check if extension is allowed in any category
  const isAllowed = Object.values(FILE_TYPE_CONFIG).some(config =>
    config.extensions.includes(extension)
  )

  if (!isAllowed) {
    return {
      valid: false,
      error: `File type .${extension} is not allowed. Allowed types: images (jpg, png, gif, webp), videos (mp4, mov, avi), documents (pdf, doc, ppt, xls)`
    }
  }

  // Verify MIME type matches extension
  const category = getFileCategory(extension)
  if (category) {
    const config = FILE_TYPE_CONFIG[category]
    if (!config.mimeTypes.includes(file.type)) {
      return {
        valid: true,
        warnings: [`MIME type ${file.type} doesn't match extension .${extension}`]
      }
    }
  }

  return { valid: true }
}

/**
 * Validate file size against maximum limits
 * Requirement: 3.2
 */
export function validateFileSize(file: File): ValidationResult {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (!extension) {
    return {
      valid: false,
      error: 'Cannot determine file type'
    }
  }

  const category = getFileCategory(extension)
  
  if (!category) {
    return {
      valid: false,
      error: 'Unknown file category'
    }
  }

  const config = FILE_TYPE_CONFIG[category]
  
  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(0)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB) for ${category}`
    }
  }

  return { valid: true }
}

/**
 * Comprehensive file validation
 * Combines type and size validation
 */
export function validateFile(file: File, fileType?: 'image' | 'video' | 'document'): ValidationResult {
  // Validate type
  const typeValidation = validateFileType(file, fileType)
  if (!typeValidation.valid) {
    return typeValidation
  }

  // Validate size
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  return {
    valid: true,
    warnings: [...(typeValidation.warnings || []), ...(sizeValidation.warnings || [])]
  }
}

/**
 * Scan file for malware (placeholder)
 * Requirement: 3.3
 * 
 * Note: In production, integrate with a malware scanning service like:
 * - ClamAV
 * - VirusTotal API
 * - AWS GuardDuty
 */
export function scanForMalware(file: File): { safe: boolean; reason?: string } {
  // TODO: Implement actual malware scanning
  // For now, perform basic checks
  
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.jar$/i
  ]

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(file.name)
  )

  if (isSuspicious) {
    return {
      safe: false,
      reason: 'File type is potentially dangerous and not allowed'
    }
  }

  // In production, send file to malware scanning service
  // const scanResult = await malwareScanningService.scan(file)
  // return scanResult

  return { safe: true }
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload file to Supabase Storage
 * Requirement: 3.4, 3.8
 */
export async function uploadFile(
  file: File,
  fileType: 'image' | 'video' | 'document',
  userId: string,
  options?: {
    bucket?: string
    path?: string
    onProgress?: (progress: number) => void
  }
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    // Validate file
    const validation = validateFile(file, fileType)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // Scan for malware
    const malwareScan = scanForMalware(file)
    if (!malwareScan.safe) {
      return {
        success: false,
        error: malwareScan.reason || 'File failed security scan'
      }
    }

    // Determine bucket and path
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const categoryKey = fileType === 'image' ? 'images' : fileType === 'video' ? 'videos' : 'documents'
    const bucket = options?.bucket || FILE_TYPE_CONFIG[categoryKey].bucket
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = options?.path || `${userId}/${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage
    const supabase = createClient()
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
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
      .getPublicUrl(storagePath)

    if (options?.onProgress) {
      options.onProgress(100)
    }

    return {
      success: true,
      url: urlData.publicUrl,
      path: storagePath
    }
  } catch (error: any) {
    console.error('Upload exception:', error)
    return {
      success: false,
      error: error.message || 'Upload failed'
    }
  }
}

// ============================================================================
// PROCESSING FUNCTIONS
// ============================================================================

/**
 * Process image file - generate optimized versions
 * Requirement: 3.5
 */
export async function processImage(file: File): Promise<{ width?: number; height?: number }> {
  try {
    // Load image to get dimensions
    const img = await loadImage(file)
    
    return {
      width: img.width,
      height: img.height
    }
  } catch (error) {
    console.error('Image processing error:', error)
    return {}
  }
}

/**
 * Process video file - extract metadata and generate thumbnail
 * Requirement: 3.6
 */
export async function processVideo(file: File): Promise<{ duration?: number; width?: number; height?: number }> {
  try {
    // Load video to extract metadata
    const video = await loadVideo(file)
    
    return {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight
      // TODO: Generate thumbnail from first frame
      // thumbnail: thumbnailUrl
    }
  } catch (error) {
    console.error('Video processing error:', error)
    return {}
  }
}

/**
 * Process document file - extract metadata
 * Requirement: 3.7
 */
export async function processDocument(file: File): Promise<{ pageCount?: number; wordCount?: number }> {
  try {
    // For PDFs, we could extract page count
    // For Word docs, we could extract word count
    // This requires additional libraries like pdf-lib or mammoth
    
    // Placeholder implementation
    return {
      // pageCount: 0,
      // wordCount: 0
    }
  } catch (error) {
    console.error('Document processing error:', error)
    return {}
  }
}

// ============================================================================
// DELETION FUNCTIONS
// ============================================================================

/**
 * Delete file from storage and database
 * Requirement: 3.10
 */
export async function deleteFile(
  bucket: string,
  path: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      return {
        success: false,
        error: storageError.message
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Delete exception:', error)
    return {
      success: false,
      error: error.message || 'Delete failed'
    }
  }
}

/**
 * Cleanup partial uploads on failure
 * Requirement: 3.9
 */
export async function cleanupFailedUpload(
  bucket: string,
  path: string
): Promise<void> {
  try {
    const supabase = createClient()
    
    await supabase.storage
      .from(bucket)
      .remove([path])
  } catch (error) {
    console.error('Cleanup error:', error)
    // Silently fail - this is best effort cleanup
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get file category from extension
 */
function getFileCategory(extension: string): 'images' | 'videos' | 'documents' | null {
  for (const [category, config] of Object.entries(FILE_TYPE_CONFIG)) {
    if (config.extensions.includes(extension)) {
      return category as 'images' | 'videos' | 'documents'
    }
  }
  return null
}

/**
 * Load image to get dimensions
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Load video to get metadata
 */
function loadVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => resolve(video)
    video.onerror = reject
    video.src = URL.createObjectURL(file)
  })
}



/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

/**
 * Get file icon based on type
 */
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType.startsWith('video/')) return '🎥'
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('word')) return '📝'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📈'
  if (fileType.includes('text')) return '📃'
  return '📎'
}
