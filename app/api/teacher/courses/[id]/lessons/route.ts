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

// GET /api/teacher/courses/[id]/lessons - Get all lessons for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')

    // TODO: Verify teacher owns this course
    let lessons = mockLessons.filter(l => l.courseId === courseId)

    if (sectionId) {
      lessons = lessons.filter(l => l.sectionId === sectionId)
    }

    return NextResponse.json({
      success: true,
      data: lessons
    })
  } catch (error) {
    console.error('Get lessons error:', error)
    return NextResponse.json(
      { error: 'Failed to get lessons' },
      { status: 500 }
    )
  }
}

// POST /api/teacher/courses/[id]/lessons - Create a new lesson
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const body = await request.json()

    // Validation
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Lesson title is required' },
        { status: 400 }
      )
    }

    if (!body.sectionId) {
      return NextResponse.json(
        { error: 'Section ID is required' },
        { status: 400 }
      )
    }

    if (!body.type || !['video', 'document', 'quiz', 'assignment', 'live-class'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Valid lesson type is required' },
        { status: 400 }
      )
    }

    // TODO: Verify teacher owns this course
    // TODO: Verify section exists

    // Create new lesson
    const newLesson = {
      id: `lesson-${Date.now()}`,
      sectionId: body.sectionId,
      courseId,
      title: body.title,
      type: body.type,
      content: body.content || {},
      duration: body.duration || '00:00',
      order: body.order || mockLessons.filter(l => l.sectionId === body.sectionId).length + 1,
      status: body.status || 'draft',
      isFree: body.isFree || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // TODO: Save to database
    mockLessons.push(newLesson)

    return NextResponse.json({
      success: true,
      data: newLesson
    })
  } catch (error) {
    console.error('Create lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}

// PUT /api/teacher/courses/[id]/lessons - Bulk update lessons (reorder)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const body = await request.json()

    if (!Array.isArray(body.lessons)) {
      return NextResponse.json(
        { error: 'Lessons array is required' },
        { status: 400 }
      )
    }

    // TODO: Verify teacher owns this course
    // TODO: Update lessons in database

    // Update order and section for each lesson
    body.lessons.forEach((lesson: any, index: number) => {
      const existingLesson = mockLessons.find(l => l.id === lesson.id)
      if (existingLesson) {
        existingLesson.order = index + 1
        existingLesson.sectionId = lesson.sectionId || existingLesson.sectionId
        existingLesson.updatedAt = new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Lessons updated successfully'
    })
  } catch (error) {
    console.error('Update lessons error:', error)
    return NextResponse.json(
      { error: 'Failed to update lessons' },
      { status: 500 }
    )
  }
}
