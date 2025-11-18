import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/teacher/courses/[id]/archive - Archive/Unarchive course
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const body = await request.json()
    const { action } = body // 'archive' or 'unarchive'

    if (!action || !['archive', 'unarchive'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "archive" or "unarchive"' },
        { status: 400 }
      )
    }

    // In production, update course status in database
    const newStatus = action === 'archive' ? 'archived' : 'published'

    return NextResponse.json({
      message: `Course ${action}d successfully`,
      courseId,
      newStatus,
      archivedAt: action === 'archive' ? new Date().toISOString() : null
    })
  } catch (error) {
    console.error('Error archiving course:', error)
    return NextResponse.json(
      { error: 'Failed to archive course' },
      { status: 500 }
    )
  }
}

// GET /api/teacher/courses/[id]/archive - Get archive status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id

    // In production, fetch from database
    return NextResponse.json({
      courseId,
      isArchived: false,
      archivedAt: null,
      canUnarchive: true
    })
  } catch (error) {
    console.error('Error fetching archive status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archive status' },
      { status: 500 }
    )
  }
}
