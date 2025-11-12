import { NextRequest, NextResponse } from 'next/server'

// Mock course details - in real app, this would come from database
const mockCourseDetails = {
  '1': {
    id: '1',
    title: 'Mathematics Grade 10 - Advanced Algebra',
    description: 'Comprehensive course covering advanced algebraic concepts including quadratic equations, polynomials, and functions.',
    thumbnail: '/api/placeholder/400/250',
    category: 'online-school',
    grade: 'Grade 10',
    subject: 'Mathematics',
    teacher: {
      id: 't1',
      name: 'Dr. Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      email: 'sarah.johnson@school.com'
    },
    price: 299,
    originalPrice: 399,
    enrollments: 245,
    status: 'published',
    createdDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    publishedDate: '2024-01-16',
    rating: 4.8,
    totalRatings: 156,
    revenue: 73255,
    completionRate: 78,
    featured: true,
    curriculum: {
      sections: [
        {
          id: 's1',
          title: 'Introduction to Algebra',
          lessons: [
            { id: 'l1', title: 'What is Algebra?', duration: 15, type: 'video', completed: 89 },
            { id: 'l2', title: 'Variables and Constants', duration: 20, type: 'video', completed: 85 }
          ]
        }
      ]
    },
    analytics: {
      views: 1250,
      watchTime: 15600,
      dropOffPoints: [
        { lessonId: 'l3', lessonTitle: 'Basic Operations Quiz', dropOffRate: 22 }
      ],
      enrollmentTrend: [
        { date: '2024-01-16', enrollments: 45 },
        { date: '2024-01-17', enrollments: 67 }
      ]
    }
  }
}

// GET /api/admin/courses/[id] - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // In real app, fetch from database
    const course = mockCourseDetails[id as keyof typeof mockCourseDetails]
    
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

// PATCH /api/admin/courses/[id] - Update course
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // In real app, fetch from database
    const course = mockCourseDetails[id as keyof typeof mockCourseDetails]
    
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
      id, // Ensure ID cannot be changed
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    // In real app, save to database
    mockCourseDetails[id as keyof typeof mockCourseDetails] = updatedCourse

    // Log the update
    console.log(`Course ${id} updated by admin`)

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

// DELETE /api/admin/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason')
    
    // In real app, fetch from database
    const course = mockCourseDetails[id as keyof typeof mockCourseDetails]
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if course has enrollments
    if (course.enrollments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments' },
        { status: 400 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Deletion reason is required' },
        { status: 400 }
      )
    }

    // In real app, soft delete or archive course
    // For now, we'll just remove from mock data
    delete mockCourseDetails[id as keyof typeof mockCourseDetails]

    // Log the deletion
    console.log(`Course ${id} deleted. Reason: ${reason}`)

    // Notify teacher about course deletion
    console.log(`Notification sent to teacher: ${course.teacher.email}`)

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