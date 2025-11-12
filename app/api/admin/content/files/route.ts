import { NextRequest, NextResponse } from 'next/server'

// Mock data - In real app, this would come from Supabase
const mockFiles = [
  {
    id: 'file_1',
    name: 'Introduction to Mathematics.mp4',
    type: 'video/mp4',
    fileType: 'video',
    size: 157286400, // ~150MB
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
  },
  {
    id: 'file_2',
    name: 'Course Syllabus.pdf',
    type: 'application/pdf',
    fileType: 'document',
    size: 2048000, // ~2MB
    folder: 'documents',
    url: '/uploads/documents/syllabus.pdf',
    uploadedBy: 'admin',
    uploadedAt: '2024-01-14T14:20:00Z',
    metadata: {
      pages: 15
    },
    usage: []
  }
]

// GET /api/admin/content/files - Get all files
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filteredFiles = [...mockFiles]

    // Filter by folder
    if (folder && folder !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.folder === folder)
    }

    // Filter by type
    if (type && type !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.fileType === type)
    }

    // Search by name
    if (search) {
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex)

    return NextResponse.json({
      files: paginatedFiles,
      pagination: {
        page,
        limit,
        total: filteredFiles.length,
        totalPages: Math.ceil(filteredFiles.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}