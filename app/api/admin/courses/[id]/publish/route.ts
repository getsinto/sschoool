import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/courses/[id]/publish - Publish or unpublish course
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { action, adminId, reason } = body
    
    // Validate required fields
    if (!action || !['publish', 'unpublish'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "publish" or "unpublish"' },
        { status: 400 }
      )
    }

    // In real app, fetch course from database
    // For now, we'll simulate the course data
    const mockCourse = {
      id,
      title: 'Sample Course',
      status: action === 'publish' ? 'draft' : 'published',
      teacher: {
        id: 't1',
        name: 'Teacher Name',
        email: 'teacher@example.com'
      },
      enrollments: 0
    }

    // Validation for publishing
    if (action === 'publish') {
      // Check if course is ready for publishing
      const validationErrors = []
      
      // In real app, validate course content
      // - Must have at least one section with lessons
      // - Must have course description
      // - Must have thumbnail
      // - Must have price set
      // - Teacher must be verified
      
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { 
            error: 'Course validation failed',
            validationErrors
          },
          { status: 400 }
        )
      }
    }

    // Validation for unpublishing
    if (action === 'unpublish') {
      if (mockCourse.enrollments > 0 && !reason) {
        return NextResponse.json(
          { error: 'Reason is required when unpublishing course with enrollments' },
          { status: 400 }
        )
      }
    }

    const newStatus = action === 'publish' ? 'published' : 'draft'
    const timestamp = new Date().toISOString()
    
    // Create activity log entry
    const logEntry = {
      courseId: id,
      action: action === 'publish' ? 'Course Published' : 'Course Unpublished',
      reason: reason || '',
      adminId,
      adminName: 'Admin User', // In real app, get from adminId
      timestamp,
      previousStatus: mockCourse.status,
      newStatus,
      metadata: {
        enrollments: mockCourse.enrollments,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }

    // In real app, update course status and log the action
    
    // Send notification email to teacher
    const emailData = {
      to: mockCourse.teacher.email,
      subject: `Course ${action === 'publish' ? 'Published' : 'Unpublished'}: ${mockCourse.title}`,
      template: action === 'publish' ? 'course-published' : 'course-unpublished',
      data: {
        teacherName: mockCourse.teacher.name,
        courseTitle: mockCourse.title,
        reason: reason || '',
        adminName: 'Admin User',
        timestamp,
        dashboardUrl: 'https://example.com/dashboard'
      }
    }

    console.log('Course status email would be sent:', emailData)

    // If publishing, update search index and cache
    if (action === 'publish') {
      console.log(`Updating search index for course ${id}`)
      console.log(`Clearing course cache for course ${id}`)
    }

    // If unpublishing with enrollments, notify students
    if (action === 'unpublish' && mockCourse.enrollments > 0) {
      console.log(`Notifying ${mockCourse.enrollments} enrolled students about course unpublishing`)
    }

    return NextResponse.json({
      message: `Course ${action}ed successfully`,
      courseStatus: newStatus,
      publishedAt: action === 'publish' ? timestamp : null,
      unpublishedAt: action === 'unpublish' ? timestamp : null,
      logEntry,
      emailSent: true,
      studentsNotified: action === 'unpublish' && mockCourse.enrollments > 0
    })
  } catch (error) {
    console.error('Error processing course publish/unpublish:', error)
    return NextResponse.json(
      { error: 'Failed to process course status change' },
      { status: 500 }
    )
  }
}

// GET /api/admin/courses/[id]/publish - Get publishing status and history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // In real app, fetch publishing history from database
    const publishingHistory = {
      courseId: id,
      currentStatus: 'published',
      publishHistory: [
        {
          id: '1',
          action: 'published',
          timestamp: '2024-01-16T10:30:00Z',
          adminName: 'Admin User',
          adminId: 'admin1'
        },
        {
          id: '2',
          action: 'unpublished',
          timestamp: '2024-01-15T14:20:00Z',
          adminName: 'Admin User',
          adminId: 'admin1',
          reason: 'Content updates required'
        }
      ],
      validationStatus: {
        isValid: true,
        errors: [],
        warnings: [
          'Course thumbnail could be higher quality',
          'Consider adding more practice exercises'
        ]
      },
      enrollmentImpact: {
        currentEnrollments: 245,
        potentialImpact: 'high' // high/medium/low based on enrollments
      }
    }

    return NextResponse.json({ publishing: publishingHistory })
  } catch (error) {
    console.error('Error fetching publishing status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publishing status' },
      { status: 500 }
    )
  }
}