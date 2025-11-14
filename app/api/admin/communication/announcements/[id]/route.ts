import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock announcement data
const mockAnnouncements = new Map([
  ['1', {
    id: '1',
    title: 'New Course Launch',
    content: '<p>We are excited to announce the launch of our new Mathematics course!</p>',
    targetAudience: ['students'],
    priority: 'normal',
    status: 'published',
    publishedAt: '2024-01-15T10:00:00Z',
    views: 245,
    createdBy: 'Admin User'
  }]
])

// GET /api/admin/communication/announcements/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcement = mockAnnouncements.get(params.id)
    
    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error('Error fetching announcement:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcement' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/communication/announcements/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const announcement = mockAnnouncements.get(params.id)
    
    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    const updatedAnnouncement = {
      ...announcement,
      ...body,
      updatedAt: new Date().toISOString()
    }

    mockAnnouncements.set(params.id, updatedAnnouncement)

    return NextResponse.json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement
    })
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/communication/announcements/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcement = mockAnnouncements.get(params.id)
    
    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    mockAnnouncements.delete(params.id)

    return NextResponse.json({
      message: 'Announcement deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
