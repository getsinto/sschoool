/**
 * Admin Teacher Assignment API
 * Feature: course-assignment-permissions
 * 
 * GET /api/admin/courses/[id]/assign-teachers - Get current assignments and available teachers
 * POST /api/admin/courses/[id]/assign-teachers - Assign multiple teachers with permissions
 * PATCH /api/admin/courses/[id]/assign-teachers - Update teacher permissions
 * DELETE /api/admin/courses/[id]/assign-teachers - Remove teacher from course
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2, 7.3, 7.4
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  canAssignTeachers, 
  getCourseAssignments,
  assignTeacherToCourse,
  removeTeacherFromCourse,
  updateTeacherPermissions
} from '@/lib/permissions/coursePermissions';
import { sendNotification } from '@/lib/notifications/delivery';
import { withTeacherAssignmentRateLimit } from '@/lib/middleware/withRateLimit';
import { logTeacherAssignment, logTeacherUnassignment, logPermissionUpdate } from '@/lib/audit/auditLogger';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const assignTeachersSchema = z.object({
  teachers: z.array(z.object({
    teacher_id: z.string().uuid(),
    can_manage_content: z.boolean().default(true),
    can_grade: z.boolean().default(true),
    can_communicate: z.boolean().default(true),
    is_primary_teacher: z.boolean().default(false)
  })).min(1, 'At least one teacher must be provided')
});

const updatePermissionsSchema = z.object({
  assignment_id: z.string().uuid(),
  can_manage_content: z.boolean().optional(),
  can_grade: z.boolean().optional(),
  can_communicate: z.boolean().optional(),
  is_primary_teacher: z.boolean().optional()
});

const removeTeacherSchema = z.object({
  teacher_id: z.string().uuid(),
  reason: z.string().optional()
});

// ============================================================================
// GET HANDLER - Get Current Assignments and Available Teachers
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const courseId = params.id;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details
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

    // Check if user can assign teachers (Requirement 7.3)
    if (!canAssignTeachers(userData)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only administrators can manage teacher assignments',
          code: 'INSUFFICIENT_PERMISSIONS',
          required_role: 'admin',
          required_level: 4,
          user_role: userData.role,
          user_level: userData.role_level
        },
        { status: 403 }
      );
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, description, status, created_by, created_at')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get current assignments (Requirement 7.4)
    const assignments = await getCourseAssignments(courseId);

    // Get assignment details with teacher information
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const { data: teacher } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            email,
            avatar_url,
            teachers (
              teacher_type,
              subjects,
              experience_years,
              bio
            )
          `)
          .eq('id', assignment.teacher_id)
          .single();

        const { data: assigner } = await supabase
          .from('users')
          .select('id, full_name, email')
          .eq('id', assignment.assigned_by)
          .single();

        return {
          ...assignment,
          teacher,
          assigned_by_user: assigner
        };
      })
    );

    // Get available teachers (not yet assigned to this course)
    const assignedTeacherIds = assignments.map(a => a.teacher_id);
    
    let availableTeachersQuery = supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        role_level,
        teachers (
          teacher_type,
          subjects,
          experience_years,
          bio,
          verified
        )
      `)
      .eq('role', 'teacher');

    if (assignedTeacherIds.length > 0) {
      availableTeachersQuery = availableTeachersQuery.not('id', 'in', `(${assignedTeacherIds.join(',')})`);
    }

    const { data: availableTeachers, error: teachersError } = await availableTeachersQuery;

    if (teachersError) {
      console.error('Error fetching available teachers:', teachersError);
    }

    // Calculate assignment statistics
    const stats = {
      total_assignments: assignments.length,
      primary_teachers: assignments.filter(a => a.is_primary_teacher).length,
      content_managers: assignments.filter(a => a.can_manage_content).length,
      graders: assignments.filter(a => a.can_grade).length,
      communicators: assignments.filter(a => a.can_communicate).length,
      available_teachers: availableTeachers?.length || 0
    };

    return NextResponse.json({
      success: true,
      course,
      assignments: assignmentsWithDetails,
      available_teachers: availableTeachers || [],
      statistics: stats
    });

  } catch (error) {
    console.error('Error in admin teacher assignment GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST HANDLER - Assign Multiple Teachers
// ============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const courseId = params.id;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details
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

    // Check if user can assign teachers (Requirements 2.1, 2.2)
    if (!canAssignTeachers(userData)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only administrators can assign teachers to courses',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = assignTeachersSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { teachers } = validationResult.data;

    // Check for single primary teacher constraint (Requirement 2.3)
    const primaryTeachers = teachers.filter(t => t.is_primary_teacher);
    if (primaryTeachers.length > 1) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Only one teacher can be designated as primary teacher',
          code: 'MULTIPLE_PRIMARY_TEACHERS'
        },
        { status: 400 }
      );
    }

    // Get existing assignments to check for existing primary teacher
    const existingAssignments = await getCourseAssignments(courseId);
    const existingPrimary = existingAssignments.find(a => a.is_primary_teacher);

    if (existingPrimary && primaryTeachers.length > 0) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'A primary teacher is already assigned to this course',
          code: 'PRIMARY_TEACHER_EXISTS',
          existing_primary_teacher_id: existingPrimary.teacher_id
        },
        { status: 409 }
      );
    }

    // Assign teachers (Requirement 2.4)
    const results = [];
    const errors = [];

    for (const teacherData of teachers) {
      try {
        const result = await assignTeacherToCourse(
          userData,
          courseId,
          teacherData.teacher_id,
          {
            can_manage_content: teacherData.can_manage_content,
            can_grade: teacherData.can_grade,
            can_communicate: teacherData.can_communicate,
            is_primary_teacher: teacherData.is_primary_teacher
          }
        );

        if (result.success) {
          results.push({
            teacher_id: teacherData.teacher_id,
            status: 'assigned',
            assignment_id: result.assignment_id
          });

          // Send notification to teacher (Requirement 2.5, 11.1, 11.2)
          const { data: course } = await supabase
            .from('courses')
            .select('title')
            .eq('id', courseId)
            .single();

          await sendNotification({
            user_id: teacherData.teacher_id,
            type: 'course_assignment',
            title: 'New Course Assignment',
            message: `You have been assigned to teach "${course?.title || 'a course'}"`,
            data: {
              course_id: courseId,
              assignment_id: result.assignment_id,
              permissions: {
                can_manage_content: teacherData.can_manage_content,
                can_grade: teacherData.can_grade,
                can_communicate: teacherData.can_communicate,
                is_primary_teacher: teacherData.is_primary_teacher
              }
            },
            priority: 'high'
          });
        } else {
          errors.push({
            teacher_id: teacherData.teacher_id,
            error: result.error || 'Assignment failed'
          });
        }
      } catch (err) {
        errors.push({
          teacher_id: teacherData.teacher_id,
          error: 'Unexpected error during assignment'
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `${results.length} teacher(s) assigned successfully`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      course_id: courseId
    }, { status: errors.length === 0 ? 201 : 207 }); // 207 Multi-Status for partial success

  } catch (error) {
    console.error('Error in admin teacher assignment POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH HANDLER - Update Teacher Permissions
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const courseId = params.id;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details
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

    // Check if user can update permissions (Requirement 7.1)
    if (!canAssignTeachers(userData)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only administrators can update teacher permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePermissionsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { assignment_id, ...permissions } = validationResult.data;

    // Get the assignment to verify it belongs to this course
    const { data: assignment, error: assignmentError } = await supabase
      .from('course_assignments')
      .select('*')
      .eq('id', assignment_id)
      .eq('course_id', courseId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found for this course' },
        { status: 404 }
      );
    }

    // If changing primary teacher status, check constraints (Requirement 2.3)
    if (permissions.is_primary_teacher === true) {
      const existingAssignments = await getCourseAssignments(courseId);
      const existingPrimary = existingAssignments.find(
        a => a.is_primary_teacher && a.id !== assignment_id
      );

      if (existingPrimary) {
        // Demote existing primary teacher
        await supabase
          .from('course_assignments')
          .update({ is_primary_teacher: false, updated_at: new Date().toISOString() })
          .eq('id', existingPrimary.id);
      }
    }

    // Update permissions (Requirement 7.1)
    const result = await updateTeacherPermissions(
      userData,
      assignment_id,
      permissions
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update permissions' },
        { status: 500 }
      );
    }

    // Send notification to teacher about permission changes (Requirement 11.3)
    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    await sendNotification({
      user_id: assignment.teacher_id,
      type: 'permission_update',
      title: 'Course Permissions Updated',
      message: `Your permissions for "${course?.title || 'a course'}" have been updated`,
      data: {
        course_id: courseId,
        assignment_id,
        old_permissions: {
          can_manage_content: assignment.can_manage_content,
          can_grade: assignment.can_grade,
          can_communicate: assignment.can_communicate,
          is_primary_teacher: assignment.is_primary_teacher
        },
        new_permissions: permissions
      },
      priority: 'medium'
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher permissions updated successfully',
      assignment_id,
      updated_permissions: permissions,
      course_id: courseId
    });

  } catch (error) {
    console.error('Error in admin teacher assignment PATCH API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE HANDLER - Remove Teacher from Course
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const courseId = params.id;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details
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

    // Check if user can remove teachers (Requirement 7.2)
    if (!canAssignTeachers(userData)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only administrators can remove teacher assignments',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validationResult = removeTeacherSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { teacher_id, reason } = validationResult.data;

    // Remove teacher from course (Requirement 7.2)
    const result = await removeTeacherFromCourse(
      userData,
      courseId,
      teacher_id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to remove teacher' },
        { status: 500 }
      );
    }

    // Send notification to teacher about removal (Requirement 11.4)
    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    await sendNotification({
      user_id: teacher_id,
      type: 'course_unassignment',
      title: 'Course Assignment Removed',
      message: `You have been removed from "${course?.title || 'a course'}"${reason ? `: ${reason}` : ''}`,
      data: {
        course_id: courseId,
        reason: reason || 'No reason provided',
        removed_by: userData.id,
        removed_at: new Date().toISOString()
      },
      priority: 'high'
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher removed from course successfully',
      teacher_id,
      course_id: courseId,
      reason: reason || undefined
    });

  } catch (error) {
    console.error('Error in admin teacher assignment DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
