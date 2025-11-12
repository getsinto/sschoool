import { NextRequest, NextResponse } from 'next/server'

// Mock folders data (same as in folders/route.ts)
const mockFolders = [
  {
    id: 'folder_1',
    name: 'Mathematics',
    path: 'mathematics',
    parentId: null,
    createdAt: '2024-01-10T10:00:00Z',
    fileCount: 15,
    totalSize: 2147483648
  },
  {
    id: 'folder_2',
    name: 'Science',
    path: 'science',
    parentId: null,
    createdAt: '2024-01-10T10:00:00Z',
    fileCount: 8,
    totalSize: 1073741824
  }
]

// GET /api/admin/content/folders/[id] - Get folder details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const folder = mockFolders.find(f => f.id === params.id)
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ folder })
  } catch (error) {
    console.error('Error fetching folder:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folder' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/content/folders/[id] - Update folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const folderIndex = mockFolders.findIndex(f => f.id === params.id)
    
    if (folderIndex === -1) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }
    
    // Update folder
    mockFolders[folderIndex] = {
      ...mockFolders[folderIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      message: 'Folder updated successfully',
      folder: mockFolders[folderIndex]
    })
  } catch (error) {
    console.error('Error updating folder:', error)
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/content/folders/[id] - Delete folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const folderIndex = mockFolders.findIndex(f => f.id === params.id)
    
    if (folderIndex === -1) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }
    
    // Check if folder has subfolders or files
    const hasSubfolders = mockFolders.some(f => f.parentId === params.id)
    const folder = mockFolders[folderIndex]
    
    if (hasSubfolders || folder.fileCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder with contents. Please move or delete all files and subfolders first.' },
        { status: 400 }
      )
    }
    
    // Delete folder
    mockFolders.splice(folderIndex, 1)
    
    return NextResponse.json({
      message: 'Folder deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    )
  }
}