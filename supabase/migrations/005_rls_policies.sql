-- Row Level Security (RLS) policies for the online education platform

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_faqs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Teachers table policies
CREATE POLICY "Teachers can view their own profile" ON teachers
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "Teachers can update their own profile" ON teachers
    FOR UPDATE USING (
        user_id = auth.uid()
    );

CREATE POLICY "Admins can view all teachers" ON teachers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public can view approved teachers" ON teachers
    FOR SELECT USING (is_approved = true);

-- Students table policies
CREATE POLICY "Students can view their own profile" ON students
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "Students can update their own profile" ON students
    FOR UPDATE USING (
        user_id = auth.uid()
    );

CREATE POLICY "Parents can view their linked students" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM parents p
            JOIN users u ON u.id = p.user_id
            WHERE u.id = auth.uid() AND students.id = ANY(p.linked_students)
        )
    );

CREATE POLICY "Teachers can view their enrolled students" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            JOIN users u ON u.id = c.created_by
            WHERE u.id = auth.uid() AND e.student_id = students.id
        )
    );

CREATE POLICY "Admins can view all students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Parents table policies
CREATE POLICY "Parents can view their own profile" ON parents
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "Parents can update their own profile" ON parents
    FOR UPDATE USING (
        user_id = auth.uid()
    );

CREATE POLICY "Admins can view all parents" ON parents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Courses table policies
CREATE POLICY "Anyone can view published courses" ON courses
    FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers can view their own courses" ON courses
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Teachers can manage their own courses" ON courses
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can view all courses" ON courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Sections table policies
CREATE POLICY "Users can view sections of accessible courses" ON sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = sections.course_id
            AND (
                c.is_published = true
                OR c.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Teachers can manage sections of their courses" ON sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = sections.course_id AND c.created_by = auth.uid()
        )
    );

-- Lessons table policies
CREATE POLICY "Users can view lessons of accessible courses" ON lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sections s
            JOIN courses c ON c.id = s.course_id
            WHERE s.id = lessons.section_id
            AND (
                (c.is_published = true AND (lessons.is_free_preview = true OR 
                 EXISTS (
                     SELECT 1 FROM enrollments e
                     JOIN students st ON st.id = e.student_id
                     WHERE st.user_id = auth.uid() AND e.course_id = c.id
                 )))
                OR c.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Teachers can manage lessons of their courses" ON lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sections s
            JOIN courses c ON c.id = s.course_id
            WHERE s.id = lessons.section_id AND c.created_by = auth.uid()
        )
    );

-- Enrollments table policies
CREATE POLICY "Students can view their own enrollments" ON enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = enrollments.student_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can create their own enrollments" ON enrollments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = enrollments.student_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view enrollments for their courses" ON enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = enrollments.course_id AND c.created_by = auth.uid()
        )
    );

CREATE POLICY "Parents can view their children's enrollments" ON enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM parents p
            WHERE p.user_id = auth.uid() 
            AND enrollments.student_id = ANY(p.linked_students)
        )
    );

-- Payments table policies
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payments" ON payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Progress tracking policies
CREATE POLICY "Students can view their own progress" ON progress_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = progress_tracking.student_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can update their own progress" ON progress_tracking
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = progress_tracking.student_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view progress for their courses" ON progress_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN sections s ON s.id = l.section_id
            JOIN courses c ON c.id = s.course_id
            WHERE l.id = progress_tracking.lesson_id AND c.created_by = auth.uid()
        )
    );

-- Quiz attempts policies
CREATE POLICY "Students can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = quiz_attempts.student_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can create their own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = quiz_attempts.student_id AND s.user_id = auth.uid()
        )
    );

-- Assignment submissions policies
CREATE POLICY "Students can view their own submissions" ON assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = assignment_submissions.student_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can create their own submissions" ON assignment_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = assignment_submissions.student_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view submissions for their courses" ON assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assignments a
            JOIN lessons l ON l.id = a.lesson_id
            JOIN sections s ON s.id = l.section_id
            JOIN courses c ON c.id = s.course_id
            WHERE a.id = assignment_submissions.assignment_id AND c.created_by = auth.uid()
        )
    );

CREATE POLICY "Teachers can grade submissions for their courses" ON assignment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assignments a
            JOIN lessons l ON l.id = a.lesson_id
            JOIN sections s ON s.id = l.section_id
            JOIN courses c ON c.id = s.course_id
            WHERE a.id = assignment_submissions.assignment_id AND c.created_by = auth.uid()
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Certificates policies
CREATE POLICY "Students can view their own certificates" ON certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = certificates.student_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can verify certificates" ON certificates
    FOR SELECT USING (true);

-- Support tickets policies
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own tickets" ON support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets" ON support_tickets
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all tickets" ON support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Announcements policies
CREATE POLICY "Everyone can view published announcements" ON announcements
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage announcements" ON announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Chatbot FAQs policies
CREATE POLICY "Everyone can view active FAQs" ON chatbot_faqs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage FAQs" ON chatbot_faqs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Coupons policies (admin only)
CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Live classes policies
CREATE POLICY "Enrolled students can view live classes" ON live_classes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            JOIN students s ON s.id = e.student_id
            WHERE s.user_id = auth.uid() AND e.course_id = live_classes.course_id
        )
    );

CREATE POLICY "Teachers can manage their live classes" ON live_classes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM teachers t
            WHERE t.id = live_classes.teacher_id AND t.user_id = auth.uid()
        )
    );

-- Quiz and assignment policies
CREATE POLICY "Enrolled students can view quizzes" ON quizzes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN sections s ON s.id = l.section_id
            JOIN enrollments e ON e.course_id = s.course_id
            JOIN students st ON st.id = e.student_id
            WHERE l.id = quizzes.lesson_id AND st.user_id = auth.uid()
        )
    );

CREATE POLICY "Enrolled students can view quiz questions" ON quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quizzes q
            JOIN lessons l ON l.id = q.lesson_id
            JOIN sections s ON s.id = l.section_id
            JOIN enrollments e ON e.course_id = s.course_id
            JOIN students st ON st.id = e.student_id
            WHERE q.id = quiz_questions.quiz_id AND st.user_id = auth.uid()
        )
    );

CREATE POLICY "Enrolled students can view assignments" ON assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN sections s ON s.id = l.section_id
            JOIN enrollments e ON e.course_id = s.course_id
            JOIN students st ON st.id = e.student_id
            WHERE l.id = assignments.lesson_id AND st.user_id = auth.uid()
        )
    );

CREATE POLICY "Enrolled students can view documents" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN sections s ON s.id = l.section_id
            JOIN enrollments e ON e.course_id = s.course_id
            JOIN students st ON st.id = e.student_id
            WHERE l.id = documents.lesson_id AND st.user_id = auth.uid()
        )
    );