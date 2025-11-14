import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock folders data
const mockFolders = new Map([
  ['folder_1', {
    id: 'folder_1',
    name: 'Mathematics',
    path: 'mathematics',
    parentId: null,
    createdAt: '2024-01-10T10:00:00Z',
    fileCount: 15,
    totalSize: 2147483648
  }]
])

// GET /api/admin/content/folders/[id] - Get folder details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const folder = mockFolders.get(params.id)
    
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
    const folder = mockFolders.get(params.id)
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    const { name, parentId } = body

    // Validate name if provided
    if (name && name.trim() === '') {
      return NextResponse.json(
        { error: 'Folder name cannot be empty' },
        { status: 400 }
      )
    }

    // Update folder properties
    const updatedFolder = {
      ...folder,
      ...(name && { name: name.trim() }),
      ...(parentId !== undefined && { parentId }),
      updatedAt: new Date().toISOString()
    }

    // Update path if name changed
    if (name) {
      const newPath = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      if (updatedFolder.parentId) {
        const parentFolder = mockFolders.get(updatedFolder.parentId)
        if (parentFolder) {
          updatedFolder.path = `${parentFolder.path}/${newPath}`
        }
      } else {
        updatedFolder.path = newPath
      }
    }

    mockFolders.set(params.id, updatedFolder)

    return NextResponse.json({
      message: 'Folder updated successfully',
      folder: updatedFolder
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
    const folder = mockFolders.get(params.id)
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Check if folder has files
    if (folder.fileCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder with files. Please move or delete files first.' },
        { status: 400 }
      )
    }

    // Check if folder has subfolders
    const hasSubfolders = Array.from(mockFolders.values()).some(
      f => f.parentId === params.id
    )

    if (hasSubfolders) {
      return NextResponse.json(
        { error: 'Cannot delete folder with subfolders. Please delete subfolders first.' },
        { status: 400 }
      )
    }

    // Delete folder
    mockFolders.delete(params.id)

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
