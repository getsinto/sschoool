import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/courses/[id]/duplicate - Duplicate course
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { newTitle, adminId, copyEnrollments = false } = body
    
    // In real app, fetch original course from database
    const originalCourse = {
      id,
      title: 'Original Course Title',
      description: 'Original course description',
      thumbnail: '/api/placeholder/300/200',
      category: 'online-school',
      grade: 'Grade 10',
      subject: 'Mathematics',
      teacher: {
        id: 't1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@school.com'
      },
      price: 299,
      curriculum: {
        sections: [
          {
            id: 's1',
            title: 'Section 1',
            lessons: [
              { id: 'l1', title: 'Lesson 1', content: 'Lesson content...' }
            ]
          }
        ]
      },
      settings: {
        enrollmentLimit: 100,
        autoApproval: true,
        certificateEnabled: true
      }
    }
    
    if (!originalCourse) {
      return NextResponse.json(
        { error: 'Original course not found' },
        { status: 404 }
      )
    }

    // Generate new course ID
    const newCourseId = `course_${Date.now()}`
    const timestamp = new Date().toISOString()
    
    // Create duplicated course
    const duplicatedCourse = {
      ...originalCourse,
      id: newCourseId,
      title: newTitle || `${originalCourse.title} (Copy)`,
      status: 'draft', // Always start as draft
      enrollments: 0, // Reset enrollments
      revenue: 0, // Reset revenue
      rating: 0, // Reset rating
      totalRatings: 0,
      featured: false, // Reset featured status
      createdDate: timestamp.split('T')[0],
      lastUpdated: timestamp.split('T')[0],
      publishedDate: null,
      
      // Generate new IDs for curriculum content
      curriculum: {
        sections: originalCourse.curriculum.sections.map((section, sIndex) => ({
          ...section,
          id: `s${newCourseId}_${sIndex + 1}`,
          lessons: section.lessons.map((lesson, lIndex) => ({
            ...lesson,
            id: `l${newCourseId}_${sIndex + 1}_${lIndex + 1}`
          }))
        }))
      }
    }

    // In real app, save duplicated course to database
    console.log('Duplicated course would be saved:', duplicatedCourse)

    // Create duplication log entry
    const logEntry = {
      originalCourseId: id,
      duplicatedCourseId: newCourseId,
      action: 'Course Duplicated',
      adminId,
      adminName: 'Admin User', // In real app, get from adminId
      timestamp,
      copySettings: {
        copyEnrollments,
        newTitle: newTitle || null
      },
      metadata: {
        originalTitle: originalCourse.title,
        newTitle: duplicatedCourse.title,
        sectionsCount: originalCourse.curriculum.sections.length,
        lessonsCount: originalCourse.curriculum.sections.reduce(
          (total, section) => total + section.lessons.length, 0
        )
      }
    }

    // Notify teacher about course duplication
    const emailData = {
      to: originalCourse.teacher.email,
      subject: `Course Duplicated: ${duplicatedCourse.title}`,
      template: 'course-duplicated',
      data: {
        teacherName: originalCourse.teacher.name,
        originalTitle: originalCourse.title,
        duplicatedTitle: duplicatedCourse.title,
        adminName: 'Admin User',
        timestamp,
        editUrl: `https://example.com/dashboard/courses/${newCourseId}/edit`
      }
    }

    console.log('Course duplication email would be sent:', emailData)

    // Copy associated files (thumbnails, videos, etc.)
    console.log(`Copying course assets from ${id} to ${newCourseId}`)

    return NextResponse.json({
      message: 'Course duplicated successfully',
      originalCourse: {
        id: originalCourse.id,
        title: originalCourse.title
      },
      duplicatedCourse: {
        id: duplicatedCourse.id,
        title: duplicatedCourse.title,
        status: duplicatedCourse.status
      },
      logEntry,
      emailSent: true,
      assetsCopied: true
    }, { status: 201 })
  } catch (error) {
    console.error('Error duplicating course:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate course' },
      { status: 500 }
    )
  }
}

// GET /api/admin/courses/[id]/duplicate - Get duplication history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // In real app, fetch duplication history from database
    const duplicationHistory = {
      courseId: id,
      duplications: [
        {
          id: 'dup1',
          duplicatedCourseId: 'course_1705123456789',
          duplicatedTitle: 'Mathematics Grade 10 - Advanced Algebra (Copy)',
          createdDate: '2024-01-20T10:30:00Z',
          adminName: 'Admin User',
          status: 'draft'
        },
        {
          id: 'dup2',
          duplicatedCourseId: 'course_1705023456789',
          duplicatedTitle: 'Mathematics Grade 10 - For Grade 11',
          createdDate: '2024-01-19T15:45:00Z',
          adminName: 'Admin User',
          status: 'published'
        }
      ],
      totalDuplications: 2,
      canDuplicate: true,
      duplicateLimit: 10 // Maximum duplications allowed
    }

    return NextResponse.json({ duplication: duplicationHistory })
  } catch (error) {
    console.error('Error fetching duplication history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch duplication history' },
      { status: 500 }
    )
  }
}