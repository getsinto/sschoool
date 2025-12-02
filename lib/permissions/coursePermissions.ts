/**
 * Course Permission Checking Module
 * 
 * Implements hierarchical role-based access control for course operations.
 * Validates permissions based on role levels, teacher assignments, and course status.
 * 
 * Requirements: 3.1, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5,
 *               6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type RoleLevel = 1 | 2 | 3 | 4 | 5;

export enum CourseAction {
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  PUBLISH = 'publish',
  MANAGE_CONTENT = 'manage_content',
  CREATE_MEETING = 'create_meeting'
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  role_level: RoleLevel;
  can_approve_courses: boolean;
  department?: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  teacher_type: 'tuition_teacher' | 'course_teacher' | 'senior_teacher';
  assigned_grades: string[];
  assigned_subjects: string[];
  can_create_courses: boolean;
  requires_course_approval: boolean;
}

export interface Course {
  id: string;
  title: string;
  created_by: string;
  created_by_role?: string;
  approval_status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  is_published: boolean;
  grade_level?: string;
  subject?: string;
}

export interface PermissionContext {
  user: User;
  teacher?: Teacher;
  course?: Course;
  action: CourseAction;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
}

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

export class PermissionDeniedError extends Error {
  constructor(
    public action: string,
    public resource: string,
    public reason: string,
    public requiredLevel?: number
  ) {
    super(`Permission denied: ${reason}`);
    this.name = 'PermissionDeniedError';
  }
}

export class AssignmentMismatchError extends Error {
  constructor(
    public teacherId: string,
    public courseGrade: string,
    public courseSubject: string
  ) {
    super(`Teacher not assigned to grade ${courseGrade} or subject ${courseSubject}`);
    this.name = 'AssignmentMismatchError';
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if teacher is assigned to a specific grade level
 * @param teacher - Teacher profile with assignments
 * @param courseGrade - Grade level to check
 * @returns true if teacher is assigned to the grade or has no grade restrictions
 */
export function isAssignedToClass(teacher: Teacher, courseGrade?: string): boolean {
  // If no grade specified on course, allow
  if (!courseGrade) return true;
  
  // If teacher has no grade restrictions, allow
  if (!teacher.assigned_grades || teacher.assigned_grades.length === 0) return true;
  
  // Check if course grade is in teacher's assigned grades
  return teacher.assigned_grades.includes(courseGrade);
}

/**
 * Check if teacher is assigned to a specific subject
 * @param teacher - Teacher profile with assignments
 * @param courseSubject - Subject to check
 * @returns true if teacher is assigned to the subject or has no subject restrictions
 */
export function isAssignedToSubject(teacher: Teacher, courseSubject?: string): boolean {
  // If no subject specified on course, allow
  if (!courseSubject) return true;
  
  // If teacher has no subject restrictions, allow
  if (!teacher.assigned_subjects || teacher.assigned_subjects.length === 0) return true;
  
  // Check if course subject is in teacher's assigned subjects
  return teacher.assigned_subjects.includes(courseSubject);
}

/**
 * Check if user has elevated permissions (admin or senior teacher)
 * @param user - User to check
 * @returns true if user has role_level >= 3
 */
function hasElevatedPermissions(user: User): boolean {
  return user.role_level >= 3;
}

/**
 * Check if user owns the course
 * @param user - User to check
 * @param course - Course to check ownership
 * @returns true if user created the course
 */
function ownsCourse(user: User, course: Course): boolean {
  return course.created_by === user.id;
}

// ============================================================================
// CORE PERMISSION FUNCTIONS
// ============================================================================

/**
 * Check if user can create a course
 * Validates: can_create_courses flag and assignment scope
 * Requirements: 3.1, 3.5
 */
export function canCreateCourse(context: PermissionContext): PermissionResult {
  const { user, teacher } = context;
  
  // Admins and senior teachers can always create courses
  if (hasElevatedPermissions(user)) {
    return { allowed: true, requiresApproval: false };
  }
  
  // Non-teachers cannot create courses
  if (user.role !== 'teacher' || !teacher) {
    return {
      allowed: false,
      reason: 'Only teachers can create courses'
    };
  }
  
  // Check if teacher has permission to create courses
  if (!teacher.can_create_courses) {
    return {
      allowed: false,
      reason: 'Teacher does not have permission to create courses'
    };
  }
  
  // If course details provided, validate assignment scope
  if (context.course) {
    const { grade_level, subject } = context.course;
    
    if (!isAssignedToClass(teacher, grade_level)) {
      return {
        allowed: false,
        reason: `Teacher is not assigned to grade ${grade_level}`
      };
    }
    
    if (!isAssignedToSubject(teacher, subject)) {
      return {
        allowed: false,
        reason: `Teacher is not assigned to subject ${subject}`
      };
    }
  }
  
  // Check if approval is required
  const requiresApproval = teacher.requires_course_approval;
  
  return {
    allowed: true,
    requiresApproval
  };
}

/**
 * Check if user can edit a course
 * Validates: ownership OR elevated permissions, and course status
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export function canEditCourse(context: PermissionContext): PermissionResult {
  const { user, teacher, course } = context;
  
  if (!course) {
    return {
      allowed: false,
      reason: 'Course not specified'
    };
  }
  
  // Admins can edit any course
  if (user.role_level >= 4) {
    return { allowed: true };
  }
  
  // Senior teachers can edit any course
  if (user.role_level >= 3) {
    return { allowed: true };
  }
  
  // Teachers can only edit their own courses
  if (user.role !== 'teacher' || !teacher) {
    return {
      allowed: false,
      reason: 'Only teachers can edit courses'
    };
  }
  
  // Check ownership
  if (!ownsCourse(user, course)) {
    return {
      allowed: false,
      reason: 'You can only edit courses you created'
    };
  }
  
  // Check course status - cannot edit approved courses unless elevated
  if (course.approval_status === 'approved' && user.role_level < 3) {
    return {
      allowed: false,
      reason: 'Cannot edit approved courses. Contact an administrator for changes.'
    };
  }
  
  // Validate assignment scope for the course
  if (course.grade_level && !isAssignedToClass(teacher, course.grade_level)) {
    return {
      allowed: false,
      reason: `You are not assigned to grade ${course.grade_level}`
    };
  }
  
  if (course.subject && !isAssignedToSubject(teacher, course.subject)) {
    return {
      allowed: false,
      reason: `You are not assigned to subject ${course.subject}`
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can delete a course
 * Validates: role level, ownership, and course status
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function canDeleteCourse(context: PermissionContext): PermissionResult {
  const { user, teacher, course } = context;
  
  if (!course) {
    return {
      allowed: false,
      reason: 'Course not specified'
    };
  }
  
  // Admins can delete any course
  if (user.role_level >= 4) {
    return { allowed: true };
  }
  
  // Senior teachers cannot delete published/approved courses
  if (user.role_level === 3) {
    if (course.is_published || course.approval_status === 'approved') {
      return {
        allowed: false,
        reason: 'Senior teachers cannot delete published or approved courses. Contact an administrator.'
      };
    }
    return { allowed: true };
  }
  
  // Lower-level teachers can only delete their own draft courses
  if (user.role !== 'teacher' || !teacher) {
    return {
      allowed: false,
      reason: 'Only teachers can delete courses'
    };
  }
  
  // Check ownership
  if (!ownsCourse(user, course)) {
    return {
      allowed: false,
      reason: 'You can only delete courses you created'
    };
  }
  
  // Check course status - can only delete drafts
  if (course.approval_status !== 'draft') {
    return {
      allowed: false,
      reason: `Cannot delete courses with status: ${course.approval_status}. Only draft courses can be deleted.`
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can publish a course
 * Validates: approval workflow requirements
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function canPublishCourse(context: PermissionContext): PermissionResult {
  const { user, teacher, course } = context;
  
  if (!course) {
    return {
      allowed: false,
      reason: 'Course not specified'
    };
  }
  
  // Admins can publish any course directly
  if (user.role_level >= 4) {
    return { allowed: true, requiresApproval: false };
  }
  
  // Senior teachers can publish directly
  if (user.role_level >= 3) {
    return { allowed: true, requiresApproval: false };
  }
  
  // Lower-level teachers must go through approval
  if (user.role !== 'teacher' || !teacher) {
    return {
      allowed: false,
      reason: 'Only teachers can publish courses'
    };
  }
  
  // Check ownership
  if (!ownsCourse(user, course)) {
    return {
      allowed: false,
      reason: 'You can only publish courses you created'
    };
  }
  
  // If teacher requires approval, set to pending instead of publishing
  if (teacher.requires_course_approval) {
    return {
      allowed: true,
      requiresApproval: true,
      reason: 'Course will be submitted for admin approval'
    };
  }
  
  return { allowed: true, requiresApproval: false };
}

/**
 * Check if user can manage course content (upload videos, documents, etc.)
 * Validates: ownership OR elevated permissions
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export function canManageCourseContent(context: PermissionContext): PermissionResult {
  const { user, teacher, course } = context;
  
  if (!course) {
    return {
      allowed: false,
      reason: 'Course not specified'
    };
  }
  
  // Admins can manage any course content
  if (user.role_level >= 4) {
    return { allowed: true };
  }
  
  // Senior teachers can manage any course content
  if (user.role_level >= 3) {
    return { allowed: true };
  }
  
  // Teachers can only manage their own course content
  if (user.role !== 'teacher' || !teacher) {
    return {
      allowed: false,
      reason: 'Only teachers can manage course content'
    };
  }
  
  // Check ownership
  if (!ownsCourse(user, course)) {
    return {
      allowed: false,
      reason: 'You can only manage content for courses you created'
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can create live class meetings for a course
 * Validates: ownership OR elevated permissions
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
export function canCreateMeeting(context: PermissionContext): PermissionResult {
  const { user, teacher, course } = context;
  
  if (!course) {
    return {
      allowed: false,
      reason: 'Course not specified'
    };
  }
  
  // Admins can create meetings for any course
  if (user.role_level >= 4) {
    return { allowed: true };
  }
  
  // Senior teachers can create meetings for any course
  if (user.role_level >= 3) {
    return { allowed: true };
  }
  
  // Teachers can only create meetings for their own courses
  if (user.role !== 'teacher' || !teacher) {
    return {
      allowed: false,
      reason: 'Only teachers can create live class meetings'
    };
  }
  
  // Check ownership
  if (!ownsCourse(user, course)) {
    return {
      allowed: false,
      reason: 'You can only create meetings for courses you created'
    };
  }
  
  // Validate assignment scope
  if (course.grade_level && !isAssignedToClass(teacher, course.grade_level)) {
    return {
      allowed: false,
      reason: `You are not assigned to grade ${course.grade_level}`
    };
  }
  
  if (course.subject && !isAssignedToSubject(teacher, course.subject)) {
    return {
      allowed: false,
      reason: `You are not assigned to subject ${course.subject}`
    };
  }
  
  return { allowed: true };
}

/**
 * Main permission check function - routes to specific permission checks
 * @param context - Permission context with user, teacher, course, and action
 * @returns Permission result with allowed flag and optional reason
 */
export function checkPermission(context: PermissionContext): PermissionResult {
  switch (context.action) {
    case CourseAction.CREATE:
      return canCreateCourse(context);
    case CourseAction.EDIT:
      return canEditCourse(context);
    case CourseAction.DELETE:
      return canDeleteCourse(context);
    case CourseAction.PUBLISH:
      return canPublishCourse(context);
    case CourseAction.MANAGE_CONTENT:
      return canManageCourseContent(context);
    case CourseAction.CREATE_MEETING:
      return canCreateMeeting(context);
    default:
      return {
        allowed: false,
        reason: 'Unknown action'
      };
  }
}
