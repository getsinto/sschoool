import { NextRequest, NextResponse } from 'next/server'

// Mock data
let mockLessons = [
  {
    id: 'lesson-1',
    sectionId: 'section-1',
    courseId: '1',
    title: 'Welcome to the Course',
    type: 'video',
    content: {},
    duration: '10:30',
    order: 1,
    status: 'published',
    isFree: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// GET /api/teacher/courses/[id]/lessons/[lessonId] - Get a specific lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const { id: courseId, lessonId } = params

    // TODO: Verify teacher owns this course
    const lesson = mockLessons.find(l => l.id === lessonId && l.courseId === courseId)

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: lesson
    })
  } catch (error) {
    console.error('Get lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to get lesson' },
      { status: 500 }
    )
  }
}

// PATCH /api/teacher/courses/[id]/lessons/[lessonId] - Update a lesson
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const { id: courseId, lessonId } = params
    const body = await request.json()

    // TODO: Verify teacher owns this course
    const lessonIndex = mockLessons.findIndex(l => l.id === lessonId && l.courseId === courseId)

    if (lessonIndex === -1) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Update lesson
    mockLessons[lessonIndex] = {
      ...mockLessons[lessonIndex],
      title: body.title || mockLessons[lessonIndex].title,
      type: body.type || mockLessons[lessonIndex].type,
      content: body.content !== undefined ? body.content : mockLessons[lessonIndex].content,
      duration: body.duration || mockLessons[lessonIndex].duration,
      order: body.order || mockLessons[lessonIndex].order,
      status: body.status || mockLessons[lessonIndex].status,
      isFree: body.isFree !== undefined ? body.isFree : mockLessons[lessonIndex].isFree,
      sectionId: body.sectionId || mockLessons[lessonIndex].sectionId,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockLessons[lessonIndex]
    })
  } catch (error) {
    console.error('Update lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    )
  }
}

// DELETE /api/teacher/courses/[id]/lessons/[lessonId] - Delete a lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const { id: courseId, lessonId } = params

    // TODO: Verify teacher owns this course
    const lessonIndex = mockLessons.findIndex(l => l.id === lessonId && l.courseId === courseId)

    if (lessonIndex === -1) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // TODO: Delete associated content (videos, documents, etc.)
    // TODO: Delete from database
    mockLessons.splice(lessonIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    })
  } catch (error) {
    console.error('Delete lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
