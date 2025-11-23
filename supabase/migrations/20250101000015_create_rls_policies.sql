-- ============================================================================
-- ROW LEVEL SECURITY POLICIES - Security policies for all tables
-- Version: 1.0.0
-- Description: Comprehensive RLS policies
-- ============================================================================

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- TEACHERS POLICIES
-- ============================================================================

CREATE POLICY "Teachers can view own profile" ON teachers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can update own profile" ON teachers
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all teachers" ON teachers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- STUDENTS POLICIES
-- ============================================================================

CREATE POLICY "Students can view own profile" ON students
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update own profile" ON students
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Parents can view linked students" ON students
    FOR SELECT USING (
        parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all students" ON students
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- PARENTS POLICIES
-- ============================================================================

CREATE POLICY "Parents can view own profile" ON parents
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Parents can update own profile" ON parents
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all parents" ON parents
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- COURSES POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view published visible courses" ON courses
    FOR SELECT USING (is_published = TRUE AND is_visible = TRUE AND is_archived = FALSE);

CREATE POLICY "Teachers can view own courses" ON courses
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Teachers can create courses" ON courses
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher')
    );

CREATE POLICY "Teachers can update own courses" ON courses
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all courses" ON courses
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- ENROLLMENTS POLICIES
-- ============================================================================

CREATE POLICY "Students can view own enrollments" ON enrollments
    FOR SELECT USING (
        student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    );

CREATE POLICY "Students can enroll in courses" ON enrollments
    FOR INSERT WITH CHECK (
        student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    );

CREATE POLICY "Teachers can view enrollments for their courses" ON enrollments
    FOR SELECT USING (
        course_id IN (SELECT id FROM courses WHERE created_by = auth.uid())
    );

CREATE POLICY "Admins can manage all enrollments" ON enrollments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- SUPPORT TICKETS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all tickets" ON support_tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- CONTENT LIBRARY POLICIES
-- ============================================================================

CREATE POLICY "Users can view non-archived files" ON content_files
    FOR SELECT USING (is_archived = FALSE OR uploaded_by = auth.uid());

CREATE POLICY "Admins and teachers can upload files" ON content_files
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

CREATE POLICY "Admins and teachers can update files" ON content_files
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

CREATE POLICY "Admins can delete files" ON content_files
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- SUBJECTS POLICIES
-- ============================================================================

CREATE POLICY "Everyone can view active subjects" ON subjects
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage subjects" ON subjects
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- TEACHER SUBJECTS POLICIES
-- ============================================================================

CREATE POLICY "Teachers can view own subjects" ON teacher_subjects
    FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert own subjects" ON teacher_subjects
    FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own pending subjects" ON teacher_subjects
    FOR UPDATE USING (teacher_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all teacher subjects" ON teacher_subjects
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- COUPONS POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view active coupons" ON coupons
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- CHATBOT FAQ POLICIES
-- ============================================================================

CREATE POLICY "Everyone can read active FAQs" ON chatbot_faq
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage FAQs" ON chatbot_faq
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- ANNOUNCEMENTS POLICIES
-- ============================================================================

CREATE POLICY "Everyone can view published announcements" ON announcements
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admins can manage announcements" ON announcements
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Comments
COMMENT ON POLICY "Users can view own profile" ON users IS 'Users can view their own profile';
COMMENT ON POLICY "Anyone can view published visible courses" ON courses IS 'Public can view published courses';
COMMENT ON POLICY "Users can view own payments" ON payments IS 'Users can view their payment history';
