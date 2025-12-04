-- Course Assignment RLS Helper Functions and Policies
-- This migration creates database functions and RLS policies to enforce permission checks

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user can manage course content
CREATE OR REPLACE FUNCTION can_manage_course_content(user_id UUID, course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admins can manage all content
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND role = 'admin' 
    AND role_level >= 4
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Teachers can manage content if assigned with permission
  RETURN EXISTS (
    SELECT 1 FROM course_assignments
    WHERE teacher_id = user_id
    AND course_assignments.course_id = can_manage_course_content.course_id
    AND can_manage_content = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create courses
CREATE OR REPLACE FUNCTION can_create_courses(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND role = 'admin'
    AND role_level >= 4
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can grade students in a course
CREATE OR REPLACE FUNCTION can_grade_students(user_id UUID, course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admins can grade in all courses
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND role = 'admin' 
    AND role_level >= 4
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Teachers can grade if assigned with permission
  RETURN EXISTS (
    SELECT 1 FROM course_assignments
    WHERE teacher_id = user_id
    AND course_assignments.course_id = can_grade_students.course_id
    AND can_grade = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can communicate with students in a course
CREATE OR REPLACE FUNCTION can_communicate_with_students(user_id UUID, course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admins can communicate in all courses
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND role = 'admin' 
    AND role_level >= 4
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Teachers can communicate if assigned with permission
  RETURN EXISTS (
    SELECT 1 FROM course_assignments
    WHERE teacher_id = user_id
    AND course_assignments.course_id = can_communicate_with_students.course_id
    AND can_communicate = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES FOR COURSES TABLE
-- ============================================================================

-- Enable RLS on courses table if not already enabled
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_insert_courses" ON courses;
DROP POLICY IF EXISTS "admin_update_course_details" ON courses;
DROP POLICY IF EXISTS "admin_delete_courses" ON courses;
DROP POLICY IF EXISTS "public_select_published_courses" ON courses;
DROP POLICY IF EXISTS "assigned_teachers_select_courses" ON courses;
DROP POLICY IF EXISTS "teachers_update_course_content" ON courses;

-- Policy: Only admins (role_level >= 4) can INSERT courses
CREATE POLICY "admin_insert_courses" ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    can_create_courses(auth.uid())
  );

-- Policy: Only admins can UPDATE course basic details
-- This policy allows updates to non-content fields
CREATE POLICY "admin_update_course_details" ON courses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND role_level >= 4
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND role_level >= 4
    )
  );

-- Policy: Teachers can UPDATE course content fields if assigned
-- This is a separate policy to allow content updates
CREATE POLICY "teachers_update_course_content" ON courses
  FOR UPDATE
  TO authenticated
  USING (
    can_manage_course_content(auth.uid(), id)
  )
  WITH CHECK (
    can_manage_course_content(auth.uid(), id)
  );

-- Policy: Only admins can DELETE courses
CREATE POLICY "admin_delete_courses" ON courses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND role_level >= 4
    )
  );

-- Policy: Anyone can SELECT published courses
CREATE POLICY "public_select_published_courses" ON courses
  FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND role_level >= 4
    )
  );

-- Policy: Assigned teachers can SELECT their courses
CREATE POLICY "assigned_teachers_select_courses" ON courses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_assignments
      WHERE course_assignments.course_id = courses.id
      AND course_assignments.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND role_level >= 4
    )
  );

-- ============================================================================
-- RLS POLICIES FOR COURSE_ASSIGNMENTS TABLE
-- ============================================================================

-- Enable RLS on course_assignments table
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_manage_all_assignments" ON course_assignments;
DROP POLICY IF EXISTS "teachers_view_own_assignments" ON course_assignments;

-- Policy: Admins can manage all course_assignments
CREATE POLICY "admin_manage_all_assignments" ON course_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND role_level >= 4
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND role_level >= 4
    )
  );

-- Policy: Teachers can view their own assignments
CREATE POLICY "teachers_view_own_assignments" ON course_assignments
  FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND role_level >= 4
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION can_manage_course_content IS 'Checks if a user can manage content for a specific course';
COMMENT ON FUNCTION can_create_courses IS 'Checks if a user has permission to create courses';
COMMENT ON FUNCTION can_grade_students IS 'Checks if a user can grade students in a specific course';
COMMENT ON FUNCTION can_communicate_with_students IS 'Checks if a user can communicate with students in a specific course';
