/**
 * Admin Course Creation API
 * Feature: course-assignment-permissions
 * 
 * POST /api/admin/courses/create - Create new course (admin only)
 * GET /api/admin/courses/create - Get form data for course creation
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 2.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canCreateCourse, assignTeacherToCourse } from '@/lib/permissions/coursePermissions';
import { withCourseCreationRateLimit } from '@/lib/middleware/withRateLimit';
import { logCourseCreation } from '@/lib/audit/auditLogger';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Course highlight schema
const courseHighlightSchema = z.object({
  text: z.string().min(1).max(100, 'Highlight text must be 100 characters or less'),
  icon: z.string().optional()
});

const createCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(200, 'Title too long'),
  // New field: subtitle
  subtitle: z.string().min(10, 'Subtitle must be at least 10 characters').max(150, 'Subtitle must be 150 characters or less'),
  description: z.string().min(1, 'Course description is required').max(2000, 'Description too long'),
  category: z.string().min(1, 'Category is required').optional(),
  subject_id: z.string().uuid('Invalid subject ID'),
  grade_level: z.string().min(1, 'Grade level is required'),
  // New field: language
  language: z.string().min(1, 'Language is required'),
  customLanguage: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration_weeks: z.number().int().min(1).max(52).optional(),
  price: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  max_students: z.number().int().min(1).max(1000).optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  is_visible: z.boolean().default(true),
  // New fields: age groups, student types, highlights, outcomes
  ageGroups: z.array(z.string()).min(1, 'At least one age group is required'),
  studentTypes: z.array(z.string()).min(1, 'At least one student type is required'),
  highlights: z.array(courseHighlightSchema).min(3, 'At least 3 highlights are required').max(10, 'Maximum 10 highlights allowed'),
  outcomes: z.array(z.string().min(1, 'Outcome cannot be empty')).min(3, 'At least 3 outcomes are required').max(8, 'Maximum 8 outcomes allowed'),
  // Optional teacher assignments during creation
  teacher_assignments: z.array(z.object({
    teacher_id: z.string().uuid(),
    can_manage_content: z.boolean().default(true),
    can_grade: z.boolean().default(true),
    can_communicate: z.boolean().default(true),
    is_primary_teacher: z.boolean().default(false)
  })).optional()
}).refine((data) => {
  // If language is "Other", customLanguage must be provided
  if (data.language === 'Other' && !data.customLanguage) {
    return false;
  }
  return true;
}, {
  message: 'Custom language must be specified when "Other" is selected',
  path: ['customLanguage']
}).refine((data) => {
  // Validate that outcomes are distinct from learning objectives if provided
  // This is a placeholder - actual implementation would need learning_objectives field
  return true;
}, {
  message: 'Outcomes should describe skills students will gain, not just learning objectives',
  path: ['outcomes']
});

const getFormDataSchema = z.object({
  include_subjects: z.boolean().default(true),
  include_teachers: z.boolean().default(true),
  include_grade_levels: z.boolean().default(true)
});

// ============================================================================
// POST HANDLER - Create Course
// ============================================================================

async function handleCourseCreation(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details with role and role_level
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, role_level, email, full_name')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check admin permissions (Requirement 1.1, 1.2)
    if (!canCreateCourse(userData)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Only administrators can create courses',
          code: 'INSUFFICIENT_PERMISSIONS',
          required_role: 'admin',
          required_level: 4,
          user_role: userData.role,
          user_level: userData.role_level || 0
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCourseSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const courseData = validationResult.data;
    const { teacher_assignments, ...courseFields } = courseData;

    // Validate subject exists
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('id', courseFields.subject_id)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    // Validate category exists and is active (if category field is provided)
    if (courseFields.category) {
      const { data: category, error: categoryError } = await supabase
        .from('course_categories')
        .select('id, name, slug, is_active')
        .eq('slug', courseFields.category)
        .single();

      if (categoryError || !category) {
        return NextResponse.json(
          { error: 'Invalid category. Please select a valid category.' },
          { status: 400 }
        );
      }

      if (!category.is_active) {
        return NextResponse.json(
          { error: 'Selected category is not active. Please choose another category.' },
          { status: 400 }
        );
      }
    }

    // Validate teachers exist (if assignments provided)
    if (teacher_assignments && teacher_assignments.length > 0) {
      const teacherIds = teacher_assignments.map(ta => ta.teacher_id);
      const { data: teachers, error: teachersError } = await supabase
        .from('users')
        .select('id, full_name, role, role_level')
        .in('id', teacherIds)
        .in('role', ['teacher', 'admin']);

      if (teachersError || !teachers || teachers.length !== teacherIds.length) {
        return NextResponse.json(
          { error: 'One or more teacher IDs are invalid' },
          { status: 400 }
        );
      }

      // Validate only one primary teacher (Requirement 2.3)
      const primaryTeachers = teacher_assignments.filter(ta => ta.is_primary_teacher);
      if (primaryTeachers.length > 1) {
        return NextResponse.json(
          { error: 'Only one primary teacher allowed per course' },
          { status: 400 }
        );
      }
    }

    // Determine created_by_role based on role_level (Requirement 1.4)
    const created_by_role = userData.role_level >= 5 ? 'super_admin' : 'admin';

    // Prepare the final language value
    const finalLanguage = courseFields.language === 'Other' && courseFields.customLanguage
      ? courseFields.customLanguage
      : courseFields.language;

    // Create course (Requirement 1.4, 1.5)
    // New fields: subtitle, language, age_groups, student_types, highlights, outcomes
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        ...courseFields,
        language: finalLanguage,
        age_groups: courseFields.ageGroups,
        student_types: courseFields.studentTypes,
        highlights: courseFields.highlights,
        outcomes: courseFields.outcomes,
        created_by: user.id,
        created_by_role: created_by_role,
        status: 'draft', // Always start as draft (Requirement 1.5)
        updated_by: user.id
      })
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
        )
      `)
      .single();

    if (courseError) {
      console.error('Error creating course:', courseError);
      return NextResponse.json(
        { error: 'Failed to create course', details: courseError.message },
        { status: 500 }
      );
    }

    // Create teacher assignments if provided (Requirement 2.1, 2.5)
    const assignments = [];
    const assignmentErrors = [];
    
    if (teacher_assignments && teacher_assignments.length > 0) {
      for (const assignment of teacher_assignments) {
        const result = await assignTeacherToCourse(
          course.id,
          assignment.teacher_id,
          user.id,
          {
            can_manage_content: assignment.can_manage_content,
            can_grade: assignment.can_grade,
            can_communicate: assignment.can_communicate,
            is_primary_teacher: assignment.is_primary_teacher
          }
        );

        if (result.success && result.assignment) {
          assignments.push(result.assignment);
        } else {
          assignmentErrors.push({
            teacher_id: assignment.teacher_id,
            error: result.error
          });
        }
      }
    }

    // Log course creation to audit log
    await logCourseCreation(
      user.id,
      userData.email || '',
      created_by_role,
      course.id,
      {
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        subject_id: course.subject_id,
        grade_level: course.grade_level,
        language: course.language,
        age_groups: course.age_groups,
        student_types: course.student_types,
        highlights_count: course.highlights?.length || 0,
        outcomes_count: course.outcomes?.length || 0,
        status: course.status,
        teacher_assignments_count: assignments.length
      },
      request
    );

    // Return success response
    return NextResponse.json({
      success: true,
      course: {
        ...course,
        teacher_assignments: assignments
      },
      assignment_errors: assignmentErrors.length > 0 ? assignmentErrors : undefined,
      message: 'Course created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in course creation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the rate-limited handler
export const POST = withCourseCreationRateLimit(handleCourseCreation);

// ============================================================================
// GET HANDLER - Get Form Data
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details with role and role_level
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, role_level')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check admin permissions
    if (!canCreateCourse(userData)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Only administrators can access course creation form data',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryValidation = getFormDataSchema.safeParse({
      include_subjects: searchParams.get('include_subjects') !== 'false',
      include_teachers: searchParams.get('include_teachers') !== 'false',
      include_grade_levels: searchParams.get('include_grade_levels') !== 'false'
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { include_subjects, include_teachers, include_grade_levels } = queryValidation.data;
    const formData: any = {};

    // Get subjects if requested
    if (include_subjects) {
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, description, category')
        .eq('is_active', true)
        .order('name');

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError);
      } else {
        formData.subjects = subjects || [];
      }
    }

    // Get available teachers if requested
    if (include_teachers) {
      const { data: teachers, error: teachersError } = await supabase
        .from('users')
        .select(`
          id, 
          full_name, 
          email, 
          role, 
          role_level,
          teachers (
            teacher_type,
            subjects,
            experience_years
          )
        `)
        .in('role', ['teacher', 'admin'])
        .eq('is_active', true)
        .order('full_name');

      if (teachersError) {
        console.error('Error fetching teachers:', teachersError);
      } else {
        formData.teachers = teachers || [];
      }
    }

    // Get grade levels if requested
    if (include_grade_levels) {
      formData.grade_levels = [
        'Pre-K',
        'Kindergarten',
        'Grade 1',
        'Grade 2',
        'Grade 3',
        'Grade 4',
        'Grade 5',
        'Grade 6',
        'Grade 7',
        'Grade 8',
        'Grade 9',
        'Grade 10',
        'Grade 11',
        'Grade 12',
        'College',
        'Adult Education'
      ];
    }

    // Get course creation metadata
    formData.metadata = {
      levels: ['beginner', 'intermediate', 'advanced'],
      statuses: ['draft', 'published'],
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      max_duration_weeks: 52,
      max_students_limit: 1000,
      supported_file_types: ['image/jpeg', 'image/png', 'image/webp'],
      max_file_size: 5 * 1024 * 1024 // 5MB
    };

    return NextResponse.json({
      success: true,
      data: formData
    });

  } catch (error) {
    console.error('Error in course creation form data API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
