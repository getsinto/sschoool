-- ============================================================================
-- HIERARCHICAL RBAC SYSTEM - Database Schema Updates
-- Version: 1.0.0
-- Description: Adds hierarchical role-based access control with 5-level
--              permission system, course approval workflow, and teacher assignments
-- Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.4, 7.2, 7.3
-- ============================================================================

-- ============================================================================
-- PART 1: USERS TABLE EXTENSIONS
-- ============================================================================

-- Add role level and approval permissions to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role_level INTEGER DEFAULT 1 CHECK (role_level BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS can_approve_courses BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.role_level IS 'Hierarchical role level: 1=Tuition Teacher, 2=Course Teacher, 3=Senior Teacher, 4=Admin, 5=Super Admin';
COMMENT ON COLUMN users.can_approve_courses IS 'Whether user can approve course submissions from lower-level teachers';
COMMENT ON COLUMN users.department IS 'Department or subject area the user belongs to';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role_level ON users(role_level);
CREATE INDEX IF NOT EXISTS idx_users_can_approve ON users(can_approve_courses) WHERE can_approve_courses = TRUE;

-- ============================================================================
-- PART 2: TEACHERS TABLE EXTENSIONS
-- ============================================================================

-- Add teacher type and assignment fields
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS teacher_type TEXT CHECK (teacher_type IN ('tuition_teacher', 'course_teacher', 'senior_teacher')),
ADD COLUMN IF NOT EXISTS assigned_grades TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_subjects TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS can_create_courses BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS requires_course_approval BOOLEAN DEFAULT TRUE;

-- Add comments for documentation
COMMENT ON COLUMN teachers.teacher_type IS 'Type of teacher determining base permissions';
COMMENT ON COLUMN teachers.assigned_grades IS 'Array of grade levels teacher is authorized for (e.g., [''1'', ''2'', ''3''])';
COMMENT ON COLUMN teachers.assigned_subjects IS 'Array of subjects teacher is authorized for (e.g., [''mathematics'', ''science''])';
COMMENT ON COLUMN teachers.can_create_courses IS 'Whether teacher has permission to create courses';
COMMENT ON COLUMN teachers.requires_course_approval IS 'Whether teacher courses need admin approval before publishing';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teachers_type ON teachers(teacher_type);
CREATE INDEX IF NOT EXISTS idx_teachers_grades ON teachers USING GIN(assigned_grades);
CREATE INDEX IF NOT EXISTS idx_teachers_subjects ON teachers USING GIN(assigned_subjects);

-- ============================================================================
-- PART 3: COURSES TABLE EXTENSIONS
-- ============================================================================

-- Add approval workflow fields to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS created_by_role TEXT CHECK (created_by_role IN ('super_admin', 'admin', 'senior_teacher', 'course_teacher', 'tuition_teacher')),
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS submission_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN courses.created_by_role IS 'Role level of the user who created the course';
COMMENT ON COLUMN courses.approval_status IS 'Current approval workflow status';
COMMENT ON COLUMN courses.approved_by IS 'Admin who approved the course';
COMMENT ON COLUMN courses.approved_at IS 'Timestamp when course was approved';
COMMENT ON COLUMN courses.rejection_reason IS 'Reason provided when course was rejected';
COMMENT ON COLUMN courses.submission_notes IS 'Notes from teacher when submitting for approval';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_approval_status ON courses(approval_status);
CREATE INDEX IF NOT EXISTS idx_courses_created_by_role ON courses(created_by_role);
CREATE INDEX IF NOT EXISTS idx_courses_pending_approval ON courses(approval_status) WHERE approval_status = 'pending_approval';

-- ============================================================================
-- PART 4: COURSE APPROVAL HISTORY TABLE
-- ============================================================================

-- Create audit trail table for approval workflow
CREATE TABLE IF NOT EXISTS course_approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'changes_requested', 'resubmitted')),
  performed_by UUID NOT NULL REFERENCES users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  feedback TEXT,
  previous_status TEXT,
  new_status TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_history_course ON course_approval_history(course_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_performed_at ON course_approval_history(performed_at DESC);

-- Add comment for documentation
COMMENT ON TABLE course_approval_history IS 'Audit trail of all course approval workflow actions';

-- ============================================================================
-- PART 5: ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Drop existing policies if they exist (to allow updates)
DROP POLICY IF EXISTS teacher_course_access ON courses;
DROP POLICY IF EXISTS admin_approval_access ON courses;
DROP POLICY IF EXISTS teacher_own_course_edit ON courses;
DROP POLICY IF EXISTS admin_all_course_edit ON courses;

-- Teachers can view courses they created or are assigned to
CREATE POLICY teacher_course_access ON courses
  FOR SELECT
  USING (
    auth.uid() = created_by 
    OR 
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.user_id = auth.uid()
      AND (
        courses.grade_level = ANY(t.assigned_grades)
        OR courses.subject = ANY(t.assigned_subjects)
      )
    )
    OR
    -- Admins and senior teachers can see all courses
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role_level >= 3
    )
  );

-- Only admins and users with approval permission can view pending approvals
CREATE POLICY admin_approval_access ON courses
  FOR SELECT
  USING (
    approval_status = 'pending_approval'
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.role_level >= 4 OR u.can_approve_courses = TRUE)
    )
  );

-- Teachers can edit their own courses (with restrictions based on status)
CREATE POLICY teacher_own_course_edit ON courses
  FOR UPDATE
  USING (
    auth.uid() = created_by
    AND (
      -- Can edit draft courses
      approval_status = 'draft'
      OR
      -- Can edit rejected courses
      approval_status = 'rejected'
      OR
      -- Senior teachers can edit pending courses
      (approval_status = 'pending_approval' AND EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role_level >= 3
      ))
    )
  );

-- Admins can edit all courses
CREATE POLICY admin_all_course_edit ON courses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role_level >= 4
    )
  );

-- ============================================================================
-- PART 6: DATA MIGRATION - SET DEFAULTS FOR EXISTING RECORDS
-- ============================================================================

-- Set default role levels for existing users based on their current role
UPDATE users 
SET role_level = CASE 
  WHEN role = 'admin' THEN 4
  WHEN role = 'teacher' THEN 2
  WHEN role = 'student' THEN 1
  WHEN role = 'parent' THEN 1
  ELSE 1
END
WHERE role_level IS NULL;

-- Set can_approve_courses for admins
UPDATE users 
SET can_approve_courses = TRUE
WHERE role = 'admin' AND can_approve_courses IS NULL;

-- Set default teacher_type for existing teachers
UPDATE teachers 
SET teacher_type = 'course_teacher'
WHERE teacher_type IS NULL;

-- Set can_create_courses for all existing teachers (grandfather clause)
UPDATE teachers 
SET can_create_courses = TRUE
WHERE can_create_courses IS NULL;

-- Set requires_course_approval to FALSE for existing teachers (grandfather clause)
-- This allows existing teachers to continue without approval workflow
UPDATE teachers 
SET requires_course_approval = FALSE
WHERE requires_course_approval IS NULL;

-- Set created_by_role for existing courses based on creator's role
UPDATE courses c
SET created_by_role = CASE 
  WHEN u.role_level = 5 THEN 'super_admin'
  WHEN u.role_level = 4 THEN 'admin'
  WHEN u.role_level = 3 THEN 'senior_teacher'
  WHEN u.role_level = 2 THEN 'course_teacher'
  ELSE 'tuition_teacher'
END
FROM users u
WHERE c.created_by = u.id AND c.created_by_role IS NULL;

-- Set approval_status to 'approved' for all existing published courses
UPDATE courses 
SET approval_status = 'approved',
    approved_at = created_at
WHERE is_published = TRUE AND approval_status = 'draft';

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- Verify users table updates
-- SELECT role, role_level, can_approve_courses, COUNT(*) 
-- FROM users 
-- GROUP BY role, role_level, can_approve_courses;

-- Verify teachers table updates
-- SELECT teacher_type, can_create_courses, requires_course_approval, COUNT(*) 
-- FROM teachers 
-- GROUP BY teacher_type, can_create_courses, requires_course_approval;

-- Verify courses table updates
-- SELECT approval_status, created_by_role, COUNT(*) 
-- FROM courses 
-- GROUP BY approval_status, created_by_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
