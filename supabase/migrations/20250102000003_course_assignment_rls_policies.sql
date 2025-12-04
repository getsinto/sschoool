-- ============================================================================
-- COURSE ASSIGNMENT RLS POLICIES
-- Version: 1.0.0
-- Description: Row Level Security policies for course assignment system
-- Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop existing course policies that conflict
-- ============================================================================

DROP POLICY IF EXISTS "Teachers can view own courses" ON courses;
DROP POLICY IF EXISTS "Teachers can create courses" ON courses;
DROP POLICY IF EXISTS "Teachers can update own courses" ON courses;

-- ============================================================================
-- STEP 2: Create new course policies with role_level enforcement
-- ============================================================================

-- Policy: Only admins with role_level >= 4 can INSERT courses
CREATE POLICY "Only admins can create courses" ON courses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND role_level >= 4
        )
    );

COMMENT ON POLICY "Only admins can create courses" ON courses IS 
'Requirement 10.1: Only admins with role_level >= 4 can create courses';

-- Policy: Only admins can UPDATE course basic details
CREATE POLICY "Only admins can update course details" ON courses
    FOR UPDATE USING (
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

COMMENT ON POLICY "Only admins can update course details" ON courses IS 
'Requirement 10.2: Only admins with role_level >= 4 can update course basic details';

-- Policy: Only admins can DELETE courses
CREATE POLICY "Only admins can delete courses" ON courses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND role_level >= 4
        )
    );

COMMENT ON POLICY "Only admins can delete courses" ON courses IS 
'Requirement 10.3: Only admins with role_level >= 4 can delete courses';

-- Policy: Assigned teachers can SELECT their courses
CREATE POLICY "Teachers can view assigned courses" ON courses
    FOR SELECT USING (
        -- Admins can view all courses
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND role_level >= 4
        )
        OR
        -- Teachers can view courses they're assigned to
        EXISTS (
            SELECT 1 FROM course_assignments 
            WHERE course_id = courses.id 
            AND teacher_id = auth.uid()
        )
        OR
        -- Anyone can view published courses
        (is_published = TRUE AND is_visible = TRUE AND is_archived = FALSE)
    );

COMMENT ON POLICY "Teachers can view assigned courses" ON courses IS 
'Teachers can only view courses they are assigned to, admins can view all, public can view published';

-- ============================================================================
-- STEP 3: Create course_assignments table policies
-- ============================================================================

-- Policy: Admins can manage all course_assignments
CREATE POLICY "Admins can manage all assignments" ON course_assignments
    FOR ALL USING (
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

COMMENT ON POLICY "Admins can manage all assignments" ON course_assignments IS 
'Only admins can create, update, and delete course assignments';

-- Policy: Teachers can view their own assignments
CREATE POLICY "Teachers can view own assignments" ON course_assignments
    FOR SELECT USING (
        teacher_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND role_level >= 4
        )
    );

COMMENT ON POLICY "Teachers can view own assignments" ON course_assignments IS 
'Teachers can view their own course assignments, admins can view all';

-- ============================================================================
-- STEP 4: Update enrollments policies for assigned teachers
-- ============================================================================

-- Drop existing teacher enrollment policy
DROP POLICY IF EXISTS "Teachers can view enrollments for their courses" ON enrollments;

-- Create new policy for assigned teachers
CREATE POLICY "Assigned teachers can view course enrollments" ON enrollments
    FOR SELECT USING (
        -- Admins can view all enrollments
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND role_level >= 4
        )
        OR
        -- Teachers can view enrollments for assigned courses
        EXISTS (
            SELECT 1 FROM course_assignments 
            WHERE course_id = enrollments.course_id 
            AND teacher_id = auth.uid()
        )
        OR
        -- Students can view their own enrollments
        student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    );

COMMENT ON POLICY "Assigned teachers can view course enrollments" ON enrollments IS 
'Teachers can only view enrollments for courses they are assigned to';

-- ============================================================================
-- STEP 5: Create helper functions for RLS policies
-- ============================================================================

-- Function to check if user is admin with sufficient role_level
CREATE OR REPLACE FUNCTION is_admin_with_level(min_level INTEGER DEFAULT 4)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin' 
        AND role_level >= min_level
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_admin_with_level(INTEGER) IS 
'Helper function to check if current user is admin with minimum role level';

-- Function to check if user has assignment with specific permission
CREATE OR REPLACE FUNCTION has_course_permission(
    p_course_id UUID,
    p_permission TEXT DEFAULT 'can_manage_content'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_permission BOOLEAN;
BEGIN
    -- Check if user is admin
    IF is_admin_with_level(4) THEN
        RETURN TRUE;
    END IF;
    
    -- Check if teacher has assignment with permission
    EXECUTE format(
        'SELECT %I FROM course_assignments WHERE course_id = $1 AND teacher_id = $2',
        p_permission
    ) INTO v_has_permission
    USING p_course_id, auth.uid();
    
    RETURN COALESCE(v_has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION has_course_permission(UUID, TEXT) IS 
'Helper function to check if user has specific permission for a course';

-- ============================================================================
-- STEP 6: Create policies for course content tables (sections, lessons)
-- ============================================================================

-- Sections policies
DROP POLICY IF EXISTS "Teachers can manage sections" ON sections;

CREATE POLICY "Assigned teachers can view sections" ON sections
    FOR SELECT USING (
        is_admin_with_level(4)
        OR
        EXISTS (
            SELECT 1 FROM course_assignments 
            WHERE course_id = sections.course_id 
            AND teacher_id = auth.uid()
        )
        OR
        -- Students can view sections of enrolled courses
        EXISTS (
            SELECT 1 FROM enrollments e
            JOIN students s ON e.student_id = s.id
            WHERE e.course_id = sections.course_id
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Assigned teachers can manage sections" ON sections
    FOR ALL USING (
        is_admin_with_level(4)
        OR
        has_course_permission(sections.course_id, 'can_manage_content')
    )
    WITH CHECK (
        is_admin_with_level(4)
        OR
        has_course_permission(sections.course_id, 'can_manage_content')
    );

-- Lessons policies
DROP POLICY IF EXISTS "Teachers can manage lessons" ON lessons;

CREATE POLICY "Assigned teachers can view lessons" ON lessons
    FOR SELECT USING (
        is_admin_with_level(4)
        OR
        EXISTS (
            SELECT 1 FROM course_assignments ca
            JOIN sections s ON s.course_id = ca.course_id
            WHERE s.id = lessons.section_id 
            AND ca.teacher_id = auth.uid()
        )
        OR
        -- Students can view lessons of enrolled courses
        EXISTS (
            SELECT 1 FROM enrollments e
            JOIN students st ON e.student_id = st.id
            JOIN sections s ON s.course_id = e.course_id
            WHERE s.id = lessons.section_id
            AND st.user_id = auth.uid()
        )
    );

CREATE POLICY "Assigned teachers can manage lessons" ON lessons
    FOR ALL USING (
        is_admin_with_level(4)
        OR
        EXISTS (
            SELECT 1 FROM course_assignments ca
            JOIN sections s ON s.course_id = ca.course_id
            WHERE s.id = lessons.section_id 
            AND ca.teacher_id = auth.uid()
            AND ca.can_manage_content = TRUE
        )
    )
    WITH CHECK (
        is_admin_with_level(4)
        OR
        EXISTS (
            SELECT 1 FROM course_assignments ca
            JOIN sections s ON s.course_id = ca.course_id
            WHERE s.id = lessons.section_id 
            AND ca.teacher_id = auth.uid()
            AND ca.can_manage_content = TRUE
        )
    );

-- Documents policies
CREATE POLICY "Assigned teachers can view documents" ON documents
    FOR SELECT USING (
        is_admin_with_level(4)
        OR
        EXISTS (
            SELECT 1 FROM course_assignments ca
            JOIN sections s ON s.course_id = ca.course_id
            JOIN lessons l ON l.section_id = s.id
            WHERE l.id = documents.lesson_id 
            AND ca.teacher_id = auth.uid()
        )
        OR
        -- Students can view documents of enrolled courses
        EXISTS (
            SELECT 1 FROM enrollments e
            JOIN students st ON e.student_id = st.id
            JOIN sections s ON s.course_id = e.course_id
            JOIN lessons l ON l.section_id = s.id
            WHERE l.id = documents.lesson_id
            AND st.user_id = auth.uid()
        )
    );

CREATE POLICY "Assigned teachers can manage documents" ON documents
    FOR ALL USING (
        is_admin_with_level(4)
        OR
        EXISTS (
            SELECT 1 FROM course_assignments ca
            JOIN sections s ON s.course_id = ca.course_id
            JOIN lessons l ON l.section_id = s.id
            WHERE l.id = documents.lesson_id 
            AND ca.teacher_id = auth.uid()
            AND ca.can_manage_content = TRUE
        )
    )
    WITH CHECK (
        is_admin_with_level(4)
        OR
        EXISTS (
            SELECT 1 FROM course_assignments ca
            JOIN sections s ON s.course_id = ca.course_id
            JOIN lessons l ON l.section_id = s.id
            WHERE l.id = documents.lesson_id 
            AND ca.teacher_id = auth.uid()
            AND ca.can_manage_content = TRUE
        )
    );

-- ============================================================================
-- STEP 7: Grant necessary permissions
-- ============================================================================

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION is_admin_with_level(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION has_course_permission(UUID, TEXT) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Course Assignment RLS Policies migration completed successfully';
    RAISE NOTICE 'Replaced teacher course creation policies with admin-only policies';
    RAISE NOTICE 'Created course_assignments table policies';
    RAISE NOTICE 'Updated enrollments policies for assigned teachers';
    RAISE NOTICE 'Created helper functions for permission checks';
    RAISE NOTICE 'Created policies for sections, lessons, and documents';
END $$;
