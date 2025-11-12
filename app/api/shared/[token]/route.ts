import { NextRequest, NextResponse } from 'next/server'

// Mock shared links storage (same as in share route)
const sharedLinks = new Map()
const mockFiles = new Map([
  ['file_1', {
    id: 'file_1',
    name: 'Introduction to Mathematics.mp4',
    type: 'video/mp4',
    fileType: 'video',
    size: 157286400,
    folder: 'mathematics',
    url: '/uploads/mathematics/intro.mp4',
    thumbnail: '/api/placeholder/300/200',
    uploadedBy: 'admin',
    uploadedAt: '2024-01-15T10:30:00Z',
    metadata: {
      duration: 1800,
      dimensions: { width: 1920, height: 1080 }
    }
  }]
])

// GET /api/shared/[token] - Access shared file
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const shareData = sharedLinks.get(params.token)
    
    if (!shareData) {
      return NextResponse.json(
        { error: 'Invalid or expired share link' },
        { status: 404 }
      )
    }
    
    // Check if link has expired
    if (shareData.expiryDate) {
      const now = new Date()
      const expiry = new Date(shareData.expiryDate)
      
      if (now > expiry) {
        return NextResponse.json(
          { error: 'Share link has expired' },
          { status: 410 }
        )
      }
    }
    
    // Get file data
    const file = mockFiles.get(shareData.fileId)
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    // Increment access count
    shareData.accessCount += 1
    sharedLinks.set(params.token, shareData)
    
    return NextResponse.json({
      file: {
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
        thumbnail: file.thumbnail
      },
      shareInfo: {
        accessCount: shareData.accessCount,
        createdAt: shareData.createdAt,
        expiryDate: shareData.expiryDate
      }
    })
  } catch (error) {
    console.error('Error accessing shared file:', error)
    return NextResponse.json(
      { error: 'Failed to access shared file' },
      { status: 500 }
    )
  }
}