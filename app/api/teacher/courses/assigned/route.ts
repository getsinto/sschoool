/**
 * Teacher Assigned Courses API
 * Feature: course-assignment-permissions
 * 
 * GET /api/teacher/courses/assigned - Get all courses assigned to the authenticated teacher
 * 
 * Requirements: 3.1, 3.2, 3.3
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserAssignedCourses } from '@/lib/permissions/coursePermissions';

// ============================================================================
// GET HANDLER - Get Assigned Courses
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details to verify they are a teacher
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

    // Verify user is a teacher
    if (userData.role !== 'teacher') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'This endpoint is only accessible to teachers',
          code: 'NOT_A_TEACHER',
          user_role: userData.role
        },
        { status: 403 }
      );
    }

    // Get assigned courses using permission library (Requirement 3.1)
    const assignedCourses = await getUserAssignedCourses(user.id);

    // Calculate statistics
    const primaryCourses = assignedCourses.filter(c => c.assignment?.is_primary_teacher);
    const secondaryCourses = assignedCourses.filter(c => !c.assignment?.is_primary_teacher);

    // Get course statistics for each course
    const coursesWithStats = await Promise.all(
      assignedCourses.map(async (course) => {
        // Get student count
        const { count: studentCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('status', 'active');

        // Get lesson count
        const { count: lessonCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        // Get module count
        const { count: moduleCount } = await supabase
          .from('course_modules')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        // Get pending submissions count (if teacher can grade)
        let pendingSubmissions = 0;
        if (course.assignment?.can_grade) {
          const { count } = await supabase
            .from('assignment_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('status', 'submitted');
          
          pendingSubmissions = count || 0;
        }

        // Get unread messages count (if teacher can communicate)
        let unreadMessages = 0;
        if (course.assignment?.can_communicate) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('recipient_id', user.id)
            .eq('read', false);
          
          unreadMessages = count || 0;
        }

        return {
          ...course,
          statistics: {
            student_count: studentCount || 0,
            lesson_count: lessonCount || 0,
            module_count: moduleCount || 0,
            pending_submissions: pendingSubmissions,
            unread_messages: unreadMessages
          }
        };
      })
    );

    // Return courses with assignment details and permissions (Requirements 3.2, 3.3)
    return NextResponse.json({
      success: true,
      courses: coursesWithStats,
      summary: {
        total_courses: assignedCourses.length,
        primary_courses: primaryCourses.length,
        secondary_courses: secondaryCourses.length,
        total_students: coursesWithStats.reduce((sum, c) => sum + (c.statistics?.student_count || 0), 0)
      },
      teacher: {
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        role: userData.role,
        role_level: userData.role_level
      }
    });

  } catch (error) {
    console.error('Error in teacher assigned courses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST HANDLER - Not Allowed
// ============================================================================
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'POST method is not supported on this endpoint',
      code: 'METHOD_NOT_ALLOWED',
      details: 'This endpoint is read-only. Teachers cannot create course assignments.',
      action: 'Contact an administrator to request course assignment',
      allowed_methods: ['GET']
    },
    { 
      status: 405,
      headers: {
        'Allow': 'GET'
      }
    }
  );
}

// ============================================================================
// PUT HANDLER - Not Allowed
// ============================================================================
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'PUT method is not supported on this endpoint',
      code: 'METHOD_NOT_ALLOWED',
      details: 'This endpoint is read-only. Teachers cannot modify course assignments.',
      action: 'Contact an administrator to request permission changes',
      allowed_methods: ['GET']
    },
    { 
      status: 405,
      headers: {
        'Allow': 'GET'
      }
    }
  );
}

// ============================================================================
// PATCH HANDLER - Not Allowed
// ============================================================================
export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'PATCH method is not supported on this endpoint',
      code: 'METHOD_NOT_ALLOWED',
      details: 'This endpoint is read-only. Teachers cannot modify course assignments.',
      action: 'Contact an administrator to request permission changes',
      allowed_methods: ['GET']
    },
    { 
      status: 405,
      headers: {
        'Allow': 'GET'
      }
    }
  );
}

// ============================================================================
// DELETE HANDLER - Not Allowed
// ============================================================================
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'DELETE method is not supported on this endpoint',
      code: 'METHOD_NOT_ALLOWED',
      details: 'This endpoint is read-only. Teachers cannot delete course assignments.',
      action: 'Contact an administrator to request assignment removal',
      allowed_methods: ['GET']
    },
    { 
      status: 405,
      headers: {
        'Allow': 'GET'
      }
    }
  );
}
