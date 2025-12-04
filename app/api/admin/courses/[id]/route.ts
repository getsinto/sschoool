/**
 * Admin Course Management API
 * Feature: course-assignment-permissions, teacher-dashboard
 * 
 * GET /api/admin/courses/[id] - Get course details
 * PATCH /api/admin/courses/[id] - Update course
 * DELETE /api/admin/courses/[id] - Delete course
 * 
 * Requirements: 1.1, 1.2, 12.1, 12.2, 12.3, 12.4, 12.5
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canCreateCourse } from '@/lib/permissions/coursePermissions'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Course highlight schema
const courseHighlightSchema = z.object({
  text: z.string().min(1).max(100, 'Highlight text must be 100 characters or less'),
  icon: z.string().optional()
})

const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().min(10).max(150).optional(),
  description: z.string().min(1).max(2000).optional(),
  category: z.string().optional(),
  subject_id: z.string().uuid().optional(),
  grade_level: z.string().optional(),
  language: z.string().optional(),
  customLanguage: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration_weeks: z.number().int().min(1).max(52).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  max_students: z.number().int().min(1).max(1000).optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  is_visible: z.boolean().optional(),
  ageGroups: z.array(z.string()).min(1).optional(),
  studentTypes: z.array(z.string()).min(1).optional(),
  highlights: z.array(courseHighlightSchema).min(3).max(10).optional(),
  outcomes: z.array(z.string().min(1)).min(3).max(8).optional()
}).refine((data) => {
  // If language is "Other", customLanguage must be provided
  if (data.language === 'Other' && !data.customLanguage) {
    return false
  }
  return true
}, {
  message: 'Custom language must be specified when "Other" is selected',
  path: ['customLanguage']
})

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
    const supabase = await createClient()
    const { id } = params
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user details with role and role_level
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, role_level, email, full_name')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check admin permissions (Requirement 1.1, 1.2)
    if (!canCreateCourse(userData)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Only administrators can update courses',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateCourseSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data
    
    // Check if course exists
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id, title, created_by')
      .eq('id', id)
      .single()

    if (fetchError || !existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Validate category if provided
    if (updateData.category) {
      const { data: category, error: categoryError } = await supabase
        .from('course_categories')
        .select('id, name, slug, is_active')
        .eq('slug', updateData.category)
        .single()

      if (categoryError || !category) {
        return NextResponse.json(
          { error: 'Invalid category. Please select a valid category.' },
          { status: 400 }
        )
      }

      if (!category.is_active) {
        return NextResponse.json(
          { error: 'Selected category is not active. Please choose another category.' },
          { status: 400 }
        )
      }
    }

    // Validate subject if provided
    if (updateData.subject_id) {
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('id', updateData.subject_id)
        .single()

      if (subjectError || !subject) {
        return NextResponse.json(
          { error: 'Invalid subject ID' },
          { status: 400 }
        )
      }
    }

    // Prepare update object with new fields
    const finalLanguage = updateData.language === 'Other' && updateData.customLanguage
      ? updateData.customLanguage
      : updateData.language

    const updateFields: any = {
      ...updateData,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    // Map camelCase to snake_case for database
    if (updateData.ageGroups) {
      updateFields.age_groups = updateData.ageGroups
      delete updateFields.ageGroups
    }
    if (updateData.studentTypes) {
      updateFields.student_types = updateData.studentTypes
      delete updateFields.studentTypes
    }
    if (finalLanguage) {
      updateFields.language = finalLanguage
    }
    
    // Remove customLanguage from update as it's not a database field
    delete updateFields.customLanguage

    // Update course in database (Requirement 12.1, 12.2, 12.3, 12.4, 12.5)
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update(updateFields)
      .eq('id', id)
      .select(`
        *,
        subjects:subject_id (
          id,
          name,
          description
        ),
        creator:created_by (
          id,
          full_name,
          email
        ),
        updater:updated_by (
          id,
          full_name,
          email
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating course:', updateError)
      return NextResponse.json(
        { error: 'Failed to update course', details: updateError.message },
        { status: 500 }
      )
    }

    // Log the update
    console.log(`Course ${id} updated by admin ${userData.email}`)

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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