import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// File type validation
const ALLOWED_TYPES = {
  video: ['video/mp4', 'video/mov', 'video/avi'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  image: ['image/jpeg', 'image/png', 'image/svg+xml'],
  audio: ['audio/mpeg', 'audio/wav']
}

const FILE_SIZE_LIMITS = {
  video: 2 * 1024 * 1024 * 1024, // 2GB
  document: 50 * 1024 * 1024,    // 50MB
  image: 10 * 1024 * 1024,       // 10MB
  audio: 20 * 1024 * 1024        // 20MB
}

const getFileType = (mimeType: string): string => {
  if (ALLOWED_TYPES.video.includes(mimeType)) return 'video'
  if (ALLOWED_TYPES.document.includes(mimeType)) return 'document'
  if (ALLOWED_TYPES.image.includes(mimeType)) return 'image'
  if (ALLOWED_TYPES.audio.includes(mimeType)) return 'audio'
  return 'unknown'
}

const generateThumbnail = async (file: File, fileType: string): Promise<string | null> => {
  // In a real implementation, you would:
  // 1. For videos: Use ffmpeg to extract a frame
  // 2. For images: Create a smaller version
  // 3. For documents: Use a PDF library to render first page
  
  // For now, return a placeholder
  if (fileType === 'video') {
    return '/api/placeholder/300/200' // Video thumbnail placeholder
  } else if (fileType === 'image') {
    return '/api/placeholder/300/200' // Image thumbnail placeholder
  } else if (fileType === 'document') {
    return '/api/placeholder/300/200' // Document thumbnail placeholder
  }
  
  return null
}

const extractMetadata = async (file: File, fileType: string) => {
  const metadata: any = {}
  
  // In a real implementation, you would extract actual metadata:
  // - Video: duration, dimensions, codec, bitrate
  // - Audio: duration, bitrate, sample rate
  // - Image: dimensions, color space, EXIF data
  // - Document: page count, author, creation date
  
  if (fileType === 'video') {
    metadata.duration = 120 // Mock 2 minutes
    metadata.dimensions = { width: 1920, height: 1080 }
    metadata.codec = 'H.264'
    metadata.bitrate = '5000 kbps'
  } else if (fileType === 'audio') {
    metadata.duration = 180 // Mock 3 minutes
    metadata.bitrate = '320 kbps'
    metadata.sampleRate = '44.1 kHz'
  } else if (fileType === 'image') {
    metadata.dimensions = { width: 1920, height: 1080 }
    metadata.colorSpace = 'sRGB'
  } else if (fileType === 'document') {
    metadata.pages = 10
    metadata.author = 'Unknown'
  }
  
  return metadata
}

// POST /api/admin/content/upload - Upload files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'root'
    const type = formData.get('type') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const fileType = getFileType(file.type)
    if (fileType === 'unknown') {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = FILE_SIZE_LIMITS[fileType as keyof typeof FILE_SIZE_LIMITS]
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit for ${fileType} files` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${timestamp}_${randomString}.${fileExtension}`
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const filePath = join(uploadDir, uniqueFilename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate thumbnail
    const thumbnail = await generateThumbnail(file, fileType)
    
    // Extract metadata
    const metadata = await extractMetadata(file, fileType)

    // Create file record
    const fileRecord = {
      id: `file_${timestamp}_${randomString}`,
      name: file.name,
      originalName: file.name,
      filename: uniqueFilename,
      type: file.type,
      fileType,
      size: file.size,
      folder,
      url: `/uploads/${folder}/${uniqueFilename}`,
      thumbnail,
      metadata,
      uploadedBy: 'admin', // In real app, get from session
      uploadedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      downloads: 0,
      usage: []
    }

    // In real app, save to database (Supabase)
    console.log('File uploaded:', fileRecord)

    // Generate thumbnail for videos (async process)
    if (fileType === 'video') {
      // Queue thumbnail generation job
      console.log('Queuing thumbnail generation for video:', fileRecord.id)
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: fileRecord,
      url: fileRecord.url
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}