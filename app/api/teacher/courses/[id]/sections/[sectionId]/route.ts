import { NextRequest, NextResponse } from 'next/server'

// Mock data
let mockSections = [
  {
    id: 'section-1',
    courseId: '1',
    title: 'Introduction to the Course',
    description: 'Get started with the basics',
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// GET /api/teacher/courses/[id]/sections/[sectionId] - Get a specific section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const { id: courseId, sectionId } = params

    // TODO: Verify teacher owns this course
    const section = mockSections.find(s => s.id === sectionId && s.courseId === courseId)

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: section
    })
  } catch (error) {
    console.error('Get section error:', error)
    return NextResponse.json(
      { error: 'Failed to get section' },
      { status: 500 }
    )
  }
}

// PATCH /api/teacher/courses/[id]/sections/[sectionId] - Update a section
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const { id: courseId, sectionId } = params
    const body = await request.json()

    // TODO: Verify teacher owns this course
    const sectionIndex = mockSections.findIndex(s => s.id === sectionId && s.courseId === courseId)

    if (sectionIndex === -1) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    // Update section
    mockSections[sectionIndex] = {
      ...mockSections[sectionIndex],
      title: body.title || mockSections[sectionIndex].title,
      description: body.description !== undefined ? body.description : mockSections[sectionIndex].description,
      order: body.order || mockSections[sectionIndex].order,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockSections[sectionIndex]
    })
  } catch (error) {
    console.error('Update section error:', error)
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    )
  }
}

// DELETE /api/teacher/courses/[id]/sections/[sectionId] - Delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const { id: courseId, sectionId } = params

    // TODO: Verify teacher owns this course
    const sectionIndex = mockSections.findIndex(s => s.id === sectionId && s.courseId === courseId)

    if (sectionIndex === -1) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    // TODO: Check if section has lessons - prevent deletion if it does
    // TODO: Delete from database
    mockSections.splice(sectionIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully'
    })
  } catch (error) {
    console.error('Delete section error:', error)
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    )
  }
}
