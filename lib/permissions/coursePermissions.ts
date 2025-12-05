/**
 * Course Assignment & Permission System Library
 * Version: 2.0.0
 * Description: Comprehensive permission checking for hierarchical RBAC
 * Requirements: 1.1, 1.2, 4.4, 4.5, 5.3, 6.3, 8.3, 9.3, 2.1, 2.2, 3.1, 7.1, 7.2, 7.3
 */

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface CourseAssignment {
  id: string;
  course_id: string;
  teacher_id: string;
  assigned_by: string;
  assigned_at: string;
  can_manage_content: boolean;
  can_grade: boolean;
  can_communicate: boolean;
  is_primary_teacher: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithRoleLevel extends User {
  role?: string;
  role_level?: number;
  full_name?: string;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  assignment?: CourseAssignment;
}

export type CoursePermission = 'can_manage_content' | 'can_grade' | 'can_communicate';

// Role level constants
export const ROLE_LEVELS = {
  STUDENT_PARENT: 0,
  TUITION_TEACHER: 1,
  COURSE_TEACHER: 2,
  SENIOR_TEACHER: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5
} as const;

export const TEACHER_TYPES = {
  TUITION_TEACHER: 'tuition_teacher',
  COURSE_TEACHER: 'course_teacher',
  SENIOR_TEACHER: 'senior_teacher'
} as const;

// ============================================================================
// CORE PERMISSION FUNCTIONS
// ============================================================================

/**
 * Check if user can create courses
 * Requirement 1.1: Only admins with role_level >= 4 can create courses
 */
export async function canCreateCourses(userId: string): Promise<PermissionCheckResult> {
  try {
    const supabase = createClient();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('role, role_level')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return {
        hasPermission: false,
        reason: 'User not found or database error'
      };
    }

    const hasPermission = user.role === 'admin' && user.role_level >= ROLE_LEVELS.ADMIN;
    
    return {
      hasPermission,
      reason: hasPermission 
        ? 'User is admin with sufficient role level' 
        : `User role: ${user.role}, level: ${user.role_level}. Required: admin with level >= 4`
    };
  } catch (error) {
    console.error('Error checking course creation permission:', error);
    return {
      hasPermission: false,
      reason: 'Permission check failed'
    };
  }
}

/**
 * Check if user has specific permission for a course
 * Requirement 4.4: Teachers can only manage assigned courses with specific permissions
 */
export async function hasCoursePermission(
  userId: string, 
  courseId: string, 
  permission: CoursePermission = 'can_manage_content'
): Promise<PermissionCheckResult> {
  try {
    const supabase = createClient();
    
    // First check if user is admin
    const adminCheck = await canCreateCourses(userId);
    if (adminCheck.hasPermission) {
      return {
        hasPermission: true,
        reason: 'User is admin with full access'
      };
    }

    // Check course assignment with specific permission
    const { data: assignment, error } = await supabase
      .from('course_assignments')
      .select('*')
      .eq('course_id', courseId)
      .eq('teacher_id', userId)
      .single();

    if (error || !assignment) {
      return {
        hasPermission: false,
        reason: 'No course assignment found for user'
      };
    }

    const hasPermission = assignment[permission] === true;
    
    return {
      hasPermission,
      reason: hasPermission 
        ? `User has ${permission} permission for course` 
        : `User lacks ${permission} permission for course`,
      assignment
    };
  } catch (error) {
    console.error('Error checking course permission:', error);
    return {
      hasPermission: false,
      reason: 'Permission check failed'
    };
  }
}

/**
 * Check if user can manage course content
 * Requirement 4.4: Content management requires can_manage_content permission
 */
export async function canManageCourseContent(userId: string, courseId: string): Promise<PermissionCheckResult> {
  return hasCoursePermission(userId, courseId, 'can_manage_content');
}

/**
 * Check if user can grade in a course
 * Requirement 5.3: Grading requires can_grade permission
 */
export async function canGradeCourse(userId: string, courseId: string): Promise<PermissionCheckResult> {
  return hasCoursePermission(userId, courseId, 'can_grade');
}

/**
 * Check if user can communicate in a course
 * Requirement 6.3: Communication requires can_communicate permission
 */
export async function canCommunicateInCourse(userId: string, courseId: string): Promise<PermissionCheckResult> {
  return hasCoursePermission(userId, courseId, 'can_communicate');
}

/**
 * Check if user is primary teacher for a course
 * Requirement 2.3: Primary teacher has additional privileges
 */
export async function isPrimaryTeacher(userId: string, courseId: string): Promise<PermissionCheckResult> {
  try {
    const supabase = createClient();
    
    const { data: assignment, error } = await supabase
      .from('course_assignments')
      .select('*')
      .eq('course_id', courseId)
      .eq('teacher_id', userId)
      .eq('is_primary_teacher', true)
      .single();

    if (error || !assignment) {
      return {
        hasPermission: false,
        reason: 'User is not primary teacher for this course'
      };
    }

    return {
      hasPermission: true,
      reason: 'User is primary teacher for this course',
      assignment
    };
  } catch (error) {
    console.error('Error checking primary teacher status:', error);
    return {
      hasPermission: false,
      reason: 'Primary teacher check failed'
    };
  }
}

/**
 * Check if user can publish/unpublish courses
 * Requirement 8.1, 8.2, 8.3: Only admins can publish or unpublish courses
 */
export async function canPublishCourse(userId: string): Promise<PermissionCheckResult> {
  return canCreateCourses(userId);
}

/**
 * Check if user can delete courses
 * Requirement 9.1, 9.3: Only admins can delete courses
 */
export async function canDeleteCourse(userId: string): Promise<PermissionCheckResult> {
  return canCreateCourses(userId);
}

/**
 * Check if user can assign teachers to courses
 * Requirement 2.1: Only admins can assign teachers
 */
export async function canAssignTeachers(userId: string): Promise<PermissionCheckResult> {
  return canCreateCourses(userId);
}

/**
 * Alias for canCreateCourses for backward compatibility
 */
export async function canCreateCourse(userId: string): Promise<PermissionCheckResult> {
  return canCreateCourses(userId);
}

// ============================================================================
// COURSE ASSIGNMENT MANAGEMENT FUNCTIONS (Task 4)
// ============================================================================

/**
 * Get all course assignments for a user
 * Requirement 3.1: Teachers can view their assignments
 */
export async function getUserAssignedCourses(userId: string): Promise<any[]> {
  try {
    const supabase = createClient();
    
    const { data: assignments, error } = await supabase
      .from('course_assignments')
      .select(`
        *,
        courses:course_id (
          id,
          title,
          description,
          thumbnail_url,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('teacher_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user course assignments:', error);
      return [];
    }

    return assignments || [];
  } catch (error) {
    console.error('Error in getUserAssignedCourses:', error);
    return [];
  }
}

/**
 * Get all teachers assigned to a course
 * Requirement 2.1: Admins can view course assignments
 */
export async function getCourseAssignments(courseId: string): Promise<CourseAssignment[]> {
  try {
    const supabase = createClient();
    
    const { data: assignments, error } = await supabase
      .from('course_assignments')
      .select(`
        *,
        users:teacher_id (
          id,
          full_name,
          email,
          role,
          role_level
        )
      `)
      .eq('course_id', courseId)
      .order('is_primary_teacher', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching course teachers:', error);
      return [];
    }

    return assignments || [];
  } catch (error) {
    console.error('Error in getCourseAssignments:', error);
    return [];
  }
}

/**
 * Create a new course assignment
 * Requirement 2.1: Only admins can assign teachers to courses
 */
export async function assignTeacherToCourse(
  courseId: string,
  teacherId: string,
  assignedBy: string,
  permissions: {
    can_manage_content?: boolean;
    can_grade?: boolean;
    can_communicate?: boolean;
    is_primary_teacher?: boolean;
  } = {}
): Promise<{ success: boolean; error?: string; assignment?: CourseAssignment }> {
  try {
    const supabase = createClient();
    
    // Verify assigner has admin permissions
    const adminCheck = await canCreateCourses(assignedBy);
    if (!adminCheck.hasPermission) {
      return {
        success: false,
        error: 'Only admins can assign teachers to courses'
      };
    }

    // Check if assignment already exists
    const { data: existing } = await supabase
      .from('course_assignments')
      .select('id')
      .eq('course_id', courseId)
      .eq('teacher_id', teacherId)
      .single();

    if (existing) {
      return {
        success: false,
        error: 'Teacher is already assigned to this course'
      };
    }

    // Create assignment with default permissions
    const assignmentData = {
      course_id: courseId,
      teacher_id: teacherId,
      assigned_by: assignedBy,
      can_manage_content: permissions.can_manage_content ?? true,
      can_grade: permissions.can_grade ?? true,
      can_communicate: permissions.can_communicate ?? true,
      is_primary_teacher: permissions.is_primary_teacher ?? false
    };

    const { data: assignment, error } = await supabase
      .from('course_assignments')
      .insert(assignmentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating course assignment:', error);
      return {
        success: false,
        error: 'Failed to create course assignment'
      };
    }

    return {
      success: true,
      assignment
    };
  } catch (error) {
    console.error('Error in assignTeacherToCourse:', error);
    return {
      success: false,
      error: 'Assignment creation failed'
    };
  }
}

/**
 * Update course assignment permissions
 * Requirement 7.1: Admins can modify assignment permissions
 */
export async function updateTeacherPermissions(
  assignmentId: string,
  updatedBy: string,
  permissions: {
    can_manage_content?: boolean;
    can_grade?: boolean;
    can_communicate?: boolean;
    is_primary_teacher?: boolean;
  }
): Promise<{ success: boolean; error?: string; assignment?: CourseAssignment }> {
  try {
    const supabase = createClient();
    
    // Verify updater has admin permissions
    const adminCheck = await canCreateCourses(updatedBy);
    if (!adminCheck.hasPermission) {
      return {
        success: false,
        error: 'Only admins can update course assignments'
      };
    }

    const { data: assignment, error } = await supabase
      .from('course_assignments')
      .update(permissions)
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating course assignment:', error);
      return {
        success: false,
        error: 'Failed to update course assignment'
      };
    }

    return {
      success: true,
      assignment
    };
  } catch (error) {
    console.error('Error in updateTeacherPermissions:', error);
    return {
      success: false,
      error: 'Assignment update failed'
    };
  }
}

/**
 * Remove teacher from course
 * Requirement 7.2: Admins can remove course assignments
 */
export async function removeTeacherFromCourse(
  assignmentId: string,
  removedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    // Verify remover has admin permissions
    const adminCheck = await canCreateCourses(removedBy);
    if (!adminCheck.hasPermission) {
      return {
        success: false,
        error: 'Only admins can remove course assignments'
      };
    }

    const { error } = await supabase
      .from('course_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Error removing course assignment:', error);
      return {
        success: false,
        error: 'Failed to remove course assignment'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error in removeTeacherFromCourse:', error);
    return {
      success: false,
      error: 'Assignment removal failed'
    };
  }
}

/**
 * Check if user has any permission for a course
 * Requirement 3.2: Check if user has any access to a course
 */
export async function hasAnyCoursePermission(userId: string, courseId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Check if user is admin
    const adminCheck = await canCreateCourses(userId);
    if (adminCheck.hasPermission) {
      return true;
    }

    // Check if user has any assignment for this course
    const { data: assignment, error } = await supabase
      .from('course_assignments')
      .select('id')
      .eq('course_id', courseId)
      .eq('teacher_id', userId)
      .single();

    return !error && !!assignment;
  } catch (error) {
    console.error('Error checking course permission:', error);
    return false;
  }
}

/**
 * Get user's role for a specific course
 * Requirement 3.3: Determine user's role in a course
 */
export async function getUserCourseRole(userId: string, courseId: string): Promise<{
  role: 'admin' | 'primary_teacher' | 'content_manager' | 'none';
  permissions: {
    can_manage_content: boolean;
    can_grade: boolean;
    can_communicate: boolean;
  };
}> {
  try {
    const supabase = createClient();
    
    // Check if user is admin
    const adminCheck = await canCreateCourses(userId);
    if (adminCheck.hasPermission) {
      return {
        role: 'admin',
        permissions: {
          can_manage_content: true,
          can_grade: true,
          can_communicate: true
        }
      };
    }

    // Check course assignment
    const { data: assignment, error } = await supabase
      .from('course_assignments')
      .select('*')
      .eq('course_id', courseId)
      .eq('teacher_id', userId)
      .single();

    if (error || !assignment) {
      return {
        role: 'none',
        permissions: {
          can_manage_content: false,
          can_grade: false,
          can_communicate: false
        }
      };
    }

    return {
      role: assignment.is_primary_teacher ? 'primary_teacher' : 'content_manager',
      permissions: {
        can_manage_content: assignment.can_manage_content,
        can_grade: assignment.can_grade,
        can_communicate: assignment.can_communicate
      }
    };
  } catch (error) {
    console.error('Error getting user course role:', error);
    return {
      role: 'none',
      permissions: {
        can_manage_content: false,
        can_grade: false,
        can_communicate: false
      }
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get user role level
 */
export async function getUserRoleLevel(userId: string): Promise<number> {
  try {
    const supabase = createClient();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('role_level')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return 0; // Default to lowest level
    }

    return user.role_level || 0;
  } catch (error) {
    console.error('Error getting user role level:', error);
    return 0;
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const result = await canCreateCourses(userId);
  return result.hasPermission;
}

/**
 * Get courses user can access (assigned or admin)
 */
export async function getUserAccessibleCourses(userId: string): Promise<string[]> {
  try {
    const supabase = createClient();
    
    // Check if user is admin
    const adminCheck = await canCreateCourses(userId);
    if (adminCheck.hasPermission) {
      // Admins can access all courses
      const { data: courses, error } = await supabase
        .from('courses')
        .select('id');
      
      if (error) {
        console.error('Error fetching all courses for admin:', error);
        return [];
      }
      
      return courses?.map(c => c.id) || [];
    }

    // Get assigned courses for teacher
    const assignments = await getUserAssignedCourses(userId);
    return assignments.map(a => a.course_id);
  } catch (error) {
    console.error('Error getting user accessible courses:', error);
    return [];
  }
}

/**
 * Validate permission parameters
 */
export function validatePermissions(permissions: Record<string, any>): boolean {
  const validPermissions = ['can_manage_content', 'can_grade', 'can_communicate', 'is_primary_teacher'];
  
  for (const key of Object.keys(permissions)) {
    if (!validPermissions.includes(key)) {
      return false;
    }
    if (typeof permissions[key] !== 'boolean') {
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// LEGACY COMPATIBILITY (for existing code)
// ============================================================================

/**
 * @deprecated Use canManageCourseContent instead
 */
export async function canManageContent(userId: string, courseId: string): Promise<boolean> {
  const result = await canManageCourseContent(userId, courseId);
  return result.hasPermission;
}

/**
 * @deprecated Use canGradeCourse instead
 */
export async function canGrade(userId: string, courseId: string): Promise<boolean> {
  const result = await canGradeCourse(userId, courseId);
  return result.hasPermission;
}

/**
 * @deprecated Use canCommunicateInCourse instead
 */
export async function canCommunicate(userId: string, courseId: string): Promise<boolean> {
  const result = await canCommunicateInCourse(userId, courseId);
  return result.hasPermission;
}

export default {
  // Core permissions
  canCreateCourses,
  hasCoursePermission,
  canManageCourseContent,
  canGradeCourse,
  canCommunicateInCourse,
  isPrimaryTeacher,
  
  // Assignment management (Task 4)
  getUserAssignedCourses,
  getCourseAssignments,
  assignTeacherToCourse,
  updateTeacherPermissions,
  removeTeacherFromCourse,
  hasAnyCoursePermission,
  getUserCourseRole,
  
  // Utilities
  getUserRoleLevel,
  isAdmin,
  getUserAccessibleCourses,
  validatePermissions,
  
  // Constants
  ROLE_LEVELS,
  TEACHER_TYPES,
  
  // Legacy (deprecated)
  canManageContent,
  canGrade,
  canCommunicate
};
