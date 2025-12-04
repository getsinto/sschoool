-- ============================================================================
-- COURSE ASSIGNMENT & PERMISSION SYSTEM
-- Version: 1.0.0
-- Description: Implements hierarchical RBAC for course management
-- Requirements: 1.1, 1.4, 2.1, 2.3, 2.5, 10.1
-- ============================================================================

-- ============================================================================
-- STEP 1: Add role_level column to users table
-- ============================================================================
-- Role levels:
--   5: Super Admin (full access)
--   4: Admin (full access)
--   3: Senior Teacher (manage assigned courses only)
--   2: Course Teacher (manage assigned courses only)
--   1: Tuition Teacher (manage assigned courses only)
--   0: Student, Parent (no course management)

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role_level INTEGER DEFAULT 1;

-- Set default role_level based on existing role
UPDATE users SET role_level = CASE
    WHEN role = 'admin' THEN 4
    WHEN role = 'teacher' THEN 2
    WHEN role = 'student' THEN 0
    WHEN role = 'parent' THEN 0
    ELSE 1
END WHERE role_level IS NULL OR role_level = 1;

-- Add check constraint
ALTER TABLE users 
ADD CONSTRAINT check_role_level 
CHECK (role_level >= 0 AND role_level <= 5);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_role_level ON users(role_level);

COMMENT ON COLUMN users.role_level IS 'Hierarchical role level: 5=Super Admin, 4=Admin, 3=Senior Teacher, 2=Course Teacher, 1=Tuition Teacher, 0=Student/Parent';

-- ============================================================================
-- STEP 2: Add teacher_type column to teachers table
-- ============================================================================

ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS teacher_type TEXT DEFAULT 'course_teacher';

-- Add check constraint
ALTER TABLE teachers 
ADD CONSTRAINT check_teacher_type 
CHECK (teacher_type IN ('senior_teacher', 'course_teacher', 'tuition_teacher'));

-- Set default teacher_type based on role_level
UPDATE teachers t
SET teacher_type = CASE
    WHEN u.role_level = 3 THEN 'senior_teacher'
    WHEN u.role_level = 2 THEN 'course_teacher'
    WHEN u.role_level = 1 THEN 'tuition_teacher'
    ELSE 'course_teacher'
END
FROM users u
WHERE t.user_id = u.id;

CREATE INDEX IF NOT EXISTS idx_teachers_type ON teachers(teacher_type);

COMMENT ON COLUMN teachers.teacher_type IS 'Teacher classification: senior_teacher, course_teacher, or tuition_teacher';

-- ============================================================================
-- STEP 3: Add course creator tracking columns
-- ============================================================================

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS created_by_role TEXT;

-- Set created_by_role for existing courses
UPDATE courses c
SET created_by_role = CASE
    WHEN u.role_level >= 5 THEN 'super_admin'
    WHEN u.role_level >= 4 THEN 'admin'
    ELSE 'admin'
END
FROM users u
WHERE c.created_by = u.id AND c.created_by_role IS NULL;

-- Add check constraint
ALTER TABLE courses 
ADD CONSTRAINT check_created_by_role 
CHECK (created_by_role IN ('super_admin', 'admin'));

CREATE INDEX IF NOT EXISTS idx_courses_created_by_role ON courses(created_by_role);

COMMENT ON COLUMN courses.created_by_role IS 'Role of the admin who created the course: super_admin or admin';

-- ============================================================================
-- STEP 4: Create course_assignments table
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Permissions
    can_manage_content BOOLEAN DEFAULT TRUE,
    can_grade BOOLEAN DEFAULT TRUE,
    can_communicate BOOLEAN DEFAULT TRUE,
    is_primary_teacher BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(course_id, teacher_id)
);

-- ============================================================================
-- STEP 5: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_course_assignments_course 
ON course_assignments(course_id);

CREATE INDEX IF NOT EXISTS idx_course_assignments_teacher 
ON course_assignments(teacher_id);

CREATE INDEX IF NOT EXISTS idx_course_assignments_primary 
ON course_assignments(course_id, is_primary_teacher) 
WHERE is_primary_teacher = TRUE;

CREATE INDEX IF NOT EXISTS idx_course_assignments_assigned_by 
ON course_assignments(assigned_by);

COMMENT ON TABLE course_assignments IS 'Junction table linking teachers to courses with specific permissions';
COMMENT ON COLUMN course_assignments.can_manage_content IS 'Permission to create/edit lessons, modules, materials, quizzes, and assignments';
COMMENT ON COLUMN course_assignments.can_grade IS 'Permission to grade student submissions and view gradebook';
COMMENT ON COLUMN course_assignments.can_communicate IS 'Permission to message students and create announcements';
COMMENT ON COLUMN course_assignments.is_primary_teacher IS 'Designates the main instructor for the course (only one per course)';

-- ============================================================================
-- STEP 6: Create trigger function to ensure single primary teacher
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_single_primary_teacher()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a teacher as primary, demote any existing primary teacher
    IF NEW.is_primary_teacher = TRUE THEN
        UPDATE course_assignments
        SET is_primary_teacher = FALSE,
            updated_at = NOW()
        WHERE course_id = NEW.course_id
          AND id != NEW.id
          AND is_primary_teacher = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_enforce_single_primary_teacher ON course_assignments;
CREATE TRIGGER trigger_enforce_single_primary_teacher
    BEFORE INSERT OR UPDATE OF is_primary_teacher ON course_assignments
    FOR EACH ROW
    EXECUTE FUNCTION enforce_single_primary_teacher();

COMMENT ON FUNCTION enforce_single_primary_teacher() IS 'Ensures only one primary teacher exists per course';

-- ============================================================================
-- STEP 7: Create notification trigger for teacher assignments
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_teacher_assignment()
RETURNS TRIGGER AS $$
DECLARE
    v_course_title TEXT;
    v_teacher_name TEXT;
    v_admin_name TEXT;
BEGIN
    -- Get course title
    SELECT title INTO v_course_title
    FROM courses
    WHERE id = NEW.course_id;
    
    -- Get teacher name
    SELECT full_name INTO v_teacher_name
    FROM users
    WHERE id = NEW.teacher_id;
    
    -- Get admin name
    SELECT full_name INTO v_admin_name
    FROM users
    WHERE id = NEW.assigned_by;
    
    -- Create notification for teacher
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_id,
        related_type,
        created_at
    ) VALUES (
        NEW.teacher_id,
        'course_assignment',
        'New Course Assignment',
        format('You have been assigned to teach "%s" by %s', v_course_title, COALESCE(v_admin_name, 'an administrator')),
        NEW.course_id,
        'course',
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_teacher_assignment ON course_assignments;
CREATE TRIGGER trigger_notify_teacher_assignment
    AFTER INSERT ON course_assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_teacher_assignment();

COMMENT ON FUNCTION notify_teacher_assignment() IS 'Creates notification when teacher is assigned to a course';

-- ============================================================================
-- STEP 8: Create notification trigger for assignment removal
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_teacher_unassignment()
RETURNS TRIGGER AS $$
DECLARE
    v_course_title TEXT;
    v_teacher_name TEXT;
BEGIN
    -- Get course title
    SELECT title INTO v_course_title
    FROM courses
    WHERE id = OLD.course_id;
    
    -- Get teacher name
    SELECT full_name INTO v_teacher_name
    FROM users
    WHERE id = OLD.teacher_id;
    
    -- Create notification for teacher
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_id,
        related_type,
        created_at
    ) VALUES (
        OLD.teacher_id,
        'course_unassignment',
        'Course Assignment Removed',
        format('You have been removed from teaching "%s"', v_course_title),
        OLD.course_id,
        'course',
        NOW()
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_teacher_unassignment ON course_assignments;
CREATE TRIGGER trigger_notify_teacher_unassignment
    BEFORE DELETE ON course_assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_teacher_unassignment();

COMMENT ON FUNCTION notify_teacher_unassignment() IS 'Creates notification when teacher is removed from a course';

-- ============================================================================
-- STEP 9: Create updated_at trigger for course_assignments
-- ============================================================================

CREATE OR REPLACE FUNCTION update_course_assignment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_course_assignment_timestamp ON course_assignments;
CREATE TRIGGER trigger_update_course_assignment_timestamp
    BEFORE UPDATE ON course_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_assignment_timestamp();

-- ============================================================================
-- STEP 10: Create helper functions for permission checks
-- ============================================================================

-- Function to check if user can create courses
CREATE OR REPLACE FUNCTION can_create_courses(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
    v_role_level INTEGER;
BEGIN
    SELECT role, role_level INTO v_role, v_role_level
    FROM users
    WHERE id = user_id;
    
    RETURN v_role = 'admin' AND v_role_level >= 4;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_create_courses(UUID) IS 'Checks if user has permission to create courses (admin with role_level >= 4)';

-- Function to check if user can manage course content
CREATE OR REPLACE FUNCTION can_manage_course_content(user_id UUID, course_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
    v_role_level INTEGER;
    v_has_permission BOOLEAN;
BEGIN
    -- Get user role
    SELECT role, role_level INTO v_role, v_role_level
    FROM users
    WHERE id = user_id;
    
    -- Admins can manage all courses
    IF v_role = 'admin' AND v_role_level >= 4 THEN
        RETURN TRUE;
    END IF;
    
    -- Check if teacher has assignment with permission
    SELECT can_manage_content INTO v_has_permission
    FROM course_assignments
    WHERE teacher_id = user_id
      AND course_assignments.course_id = can_manage_course_content.course_id;
    
    RETURN COALESCE(v_has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_manage_course_content(UUID, UUID) IS 'Checks if user has permission to manage content for a specific course';

-- ============================================================================
-- STEP 11: Grant necessary permissions
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on course_assignments table
GRANT SELECT ON course_assignments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON course_assignments TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION can_create_courses(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_manage_course_content(UUID, UUID) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Course Assignment & Permission System migration completed successfully';
    RAISE NOTICE 'Created course_assignments table with permission tracking';
    RAISE NOTICE 'Added role_level to users table';
    RAISE NOTICE 'Added teacher_type to teachers table';
    RAISE NOTICE 'Added created_by_role to courses table';
    RAISE NOTICE 'Created triggers for single primary teacher enforcement';
    RAISE NOTICE 'Created triggers for assignment notifications';
    RAISE NOTICE 'Created helper functions for permission checks';
END $$;
