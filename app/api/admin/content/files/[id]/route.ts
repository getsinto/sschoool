import { NextRequest, NextResponse } from 'next/server'

// Mock file data
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
    },
    usage: [
      { courseId: 'course_1', courseTitle: 'Basic Mathematics', usageType: 'lesson' }
    ]
  }]
])

// GET /api/admin/content/files/[id] - Get file details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const file = mockFiles.get(params.id)
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ file })
  } catch (error) {
    console.error('Error fetching file:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/content/files/[id] - Update file
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const file = mockFiles.get(params.id)
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Update file properties
    const updatedFile = {
      ...file,
      ...body,
      lastModified: new Date().toISOString()
    }

    mockFiles.set(params.id, updatedFile)

    return NextResponse.json({
      message: 'File updated successfully',
      file: updatedFile
    })
  } catch (error) {
    console.error('Error updating file:', error)
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/content/files/[id] - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const file = mockFiles.get(params.id)
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // In real app, delete from filesystem and database
    mockFiles.delete(params.id)

    return NextResponse.json({
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}