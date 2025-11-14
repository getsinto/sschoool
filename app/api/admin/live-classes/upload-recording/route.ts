import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

// POST /api/admin/live-classes/upload-recording - Upload class recording
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const classId = formData.get('classId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      )
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 2GB limit' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `recording_${classId}_${timestamp}_${randomString}.${fileExtension}`

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'recordings', classId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const filePath = join(uploadDir, uniqueFilename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const recordingUrl = `/recordings/${classId}/${uniqueFilename}`

    // In real app, also:
    // 1. Generate thumbnail
    // 2. Extract video metadata (duration, resolution, etc.)
    // 3. Queue video processing job (transcoding, compression)
    // 4. Save recording info to database

    const recordingData = {
      recordingId: `rec_${timestamp}_${randomString}`,
      classId,
      filename: file.name,
      size: file.size,
      url: recordingUrl,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      duration: 0, // Would be extracted from video
      thumbnailUrl: null // Would be generated
    }

    // Simulate processing
    console.log('Recording uploaded, queuing processing job:', recordingData)

    return NextResponse.json({
      message: 'Recording uploaded successfully',
      recording: recordingData,
      url: recordingUrl
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading recording:', error)
    return NextResponse.json(
      { error: 'Failed to upload recording' },
      { status: 500 }
    )
  }
}

// GET /api/admin/live-classes/upload-recording - Get recording status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordingId = searchParams.get('recordingId')

    if (!recordingId) {
      return NextResponse.json(
        { error: 'Recording ID is required' },
        { status: 400 }
      )
    }

    // In real app, fetch from database
    const recordingStatus = {
      recordingId,
      status: 'ready', // processing, ready, failed
      progress: 100,
      url: '/recordings/sample.mp4',
      thumbnailUrl: '/recordings/sample-thumb.jpg',
      duration: 3600,
      processedAt: new Date().toISOString()
    }

    return NextResponse.json({
      recording: recordingStatus
    })
  } catch (error) {
    console.error('Error fetching recording status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recording status' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/live-classes/upload-recording - Delete recording
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordingId = searchParams.get('recordingId')

    if (!recordingId) {
      return NextResponse.json(
        { error: 'Recording ID is required' },
        { status: 400 }
      )
    }

    // In real app:
    // 1. Delete file from storage
    // 2. Delete from database
    // 3. Remove from CDN if applicable

    console.log('Recording deleted:', recordingId)

    return NextResponse.json({
      message: 'Recording deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting recording:', error)
    return NextResponse.json(
      { error: 'Failed to delete recording' },
      { status: 500 }
    )
  }
}
