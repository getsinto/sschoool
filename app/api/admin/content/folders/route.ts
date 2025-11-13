import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock folders data
const mockFolders = [
  {
    id: 'folder_1',
    name: 'Mathematics',
    path: 'mathematics',
    parentId: null,
    createdAt: '2024-01-10T10:00:00Z',
    fileCount: 15,
    totalSize: 2147483648 // 2GB
  },
  {
    id: 'folder_2',
    name: 'Science',
    path: 'science',
    parentId: null,
    createdAt: '2024-01-10T10:00:00Z',
    fileCount: 8,
    totalSize: 1073741824 // 1GB
  },
  {
    id: 'folder_3',
    name: 'Physics',
    path: 'science/physics',
    parentId: 'folder_2',
    createdAt: '2024-01-12T14:30:00Z',
    fileCount: 5,
    totalSize: 536870912 // 512MB
  },
  {
    id: 'folder_4',
    name: 'Documents',
    path: 'documents',
    parentId: null,
    createdAt: '2024-01-08T09:15:00Z',
    fileCount: 25,
    totalSize: 104857600 // 100MB
  }
]

// GET /api/admin/content/folders - Get folder structure
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    
    let folders = [...mockFolders]
    
    // Filter by parent folder if specified
    if (parentId !== null) {
      folders = folders.filter(folder => folder.parentId === parentId)
    }
    
    return NextResponse.json({ folders })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    )
  }
}

// POST /api/admin/content/folders - Create new folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, parentId } = body
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }
    
    // Generate folder path
    let path = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    if (parentId) {
      const parentFolder = mockFolders.find(f => f.id === parentId)
      if (parentFolder) {
        path = `${parentFolder.path}/${path}`
      }
    }
    
    // Create new folder
    const newFolder = {
      id: `folder_${Date.now()}`,
      name: name.trim(),
      path,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      fileCount: 0,
      totalSize: 0
    }
    
    mockFolders.push(newFolder)
    
    return NextResponse.json({
      message: 'Folder created successfully',
      folder: newFolder
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}