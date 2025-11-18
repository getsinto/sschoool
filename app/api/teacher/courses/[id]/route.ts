import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock course data
const mockCourseDetails = {
  '1': {
    id: '1',
    title: 'Advanced Mathematics',
    description: 'Comprehensive mathematics course covering advanced topics for Grade 10 students',
    thumbnail: '/course-thumbnails/math.jpg',
    category: 'Mathematics',
    grade: 'Grade 10',
    subject: 'Algebra',
    status: 'published',
    price: 49.99,
    totalEnrollments: 245,
    activeStudents: 198,
    completionRate: 78,
    averageRating: 4.8,
    totalRevenue: 12450,
    sections: 8,
    lessons: 42,
    duration: '24 hours',
    createdAt: '2023-12-01',
    lastUpdated: '2024-01-10',
    instructor: {
      id: 'teacher1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    settings: {
      enrollmentEnabled: true,
      certificateEnabled: true,
      maxStudents: 500,
      prerequisite: null
    }
  }
}

// GET /api/teacher/courses/[id] - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const course = mockCourseDetails[courseId as keyof typeof mockCourseDetails]

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

// PATCH /api/teacher/courses/[id] - Update course
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const body = await request.json()

    const course = mockCourseDetails[courseId as keyof typeof mockCourseDetails]

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Update course fields
    const updatedCourse = {
      ...course,
      ...body,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    // In production, save to database
    mockCourseDetails[courseId as keyof typeof mockCourseDetails] = updatedCourse

    return NextResponse.json({
      message: 'Course updated successfully',
      course: updatedCourse
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE /api/teacher/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const course = mockCourseDetails[courseId as keyof typeof mockCourseDetails]

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // In production, delete from database
    delete mockCourseDetails[courseId as keyof typeof mockCourseDetails]

    return NextResponse.json({
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
