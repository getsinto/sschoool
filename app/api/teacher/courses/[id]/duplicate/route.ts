import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/teacher/courses/[id]/duplicate - Duplicate course
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const body = await request.json()
    const { newTitle, copyContent, copyStudents } = body

    if (!newTitle) {
      return NextResponse.json(
        { error: 'New course title is required' },
        { status: 400 }
      )
    }

    // In production, duplicate course in database
    const duplicatedCourse = {
      id: `${courseId}-copy-${Date.now()}`,
      title: newTitle,
      description: `Copy of course ${courseId}`,
      status: 'draft',
      enrollments: copyStudents ? 0 : 0, // Always 0 for new course
      createdAt: new Date().toISOString(),
      copiedFrom: courseId,
      contentCopied: copyContent || false
    }

    return NextResponse.json({
      message: 'Course duplicated successfully',
      course: duplicatedCourse
    }, { status: 201 })
  } catch (error) {
    console.error('Error duplicating course:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate course' },
      { status: 500 }
    )
  }
}
