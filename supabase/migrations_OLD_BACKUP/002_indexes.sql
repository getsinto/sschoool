-- Performance indexes for the online education platform

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Teachers table indexes
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_is_approved ON teachers(is_approved);
CREATE INDEX idx_teachers_subjects ON teachers USING GIN(subjects);

-- Students table indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_students_student_type ON students(student_type);
CREATE INDEX idx_students_grade_level ON students(grade_level);

-- Parents table indexes
CREATE INDEX idx_parents_user_id ON parents(user_id);
CREATE INDEX idx_parents_linked_students ON parents USING GIN(linked_students);

-- Courses table indexes
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_courses_grade_level ON courses(grade_level);
CREATE INDEX idx_courses_subject ON courses(subject);
CREATE INDEX idx_courses_price ON courses(price);
CREATE INDEX idx_courses_created_at ON courses(created_at);

-- Sections table indexes
CREATE INDEX idx_sections_course_id ON sections(course_id);
CREATE INDEX idx_sections_order_index ON sections(order_index);

-- Lessons table indexes
CREATE INDEX idx_lessons_section_id ON lessons(section_id);
CREATE INDEX idx_lessons_lesson_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_is_free_preview ON lessons(is_free_preview);
CREATE INDEX idx_lessons_order_index ON lessons(order_index);

-- Documents table indexes
CREATE INDEX idx_documents_lesson_id ON documents(lesson_id);
CREATE INDEX idx_documents_file_type ON documents(file_type);

-- Enrollments table indexes
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_enrollment_date ON enrollments(enrollment_date);
CREATE INDEX idx_enrollments_payment_id ON enrollments(payment_id);

-- Payments table indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_course_id ON payments(course_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_gateway ON payments(payment_gateway);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Coupons table indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid_from_until ON coupons(valid_from, valid_until);
CREATE INDEX idx_coupons_applicable_courses ON coupons USING GIN(applicable_courses);

-- Live Classes table indexes
CREATE INDEX idx_live_classes_course_id ON live_classes(course_id);
CREATE INDEX idx_live_classes_teacher_id ON live_classes(teacher_id);
CREATE INDEX idx_live_classes_scheduled_at ON live_classes(scheduled_at);
CREATE INDEX idx_live_classes_status ON live_classes(status);
CREATE INDEX idx_live_classes_platform ON live_classes(platform);

-- Quizzes table indexes
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);

-- Quiz Questions table indexes
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_order_index ON quiz_questions(order_index);

-- Quiz Attempts table indexes
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);

-- Assignments table indexes
CREATE INDEX idx_assignments_lesson_id ON assignments(lesson_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

-- Assignment Submissions table indexes
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_assignment_submissions_status ON assignment_submissions(status);
CREATE INDEX idx_assignment_submissions_submitted_at ON assignment_submissions(submitted_at);

-- Progress Tracking table indexes
CREATE INDEX idx_progress_tracking_student_id ON progress_tracking(student_id);
CREATE INDEX idx_progress_tracking_lesson_id ON progress_tracking(lesson_id);
CREATE INDEX idx_progress_tracking_status ON progress_tracking(status);
CREATE INDEX idx_progress_tracking_updated_at ON progress_tracking(updated_at);

-- Notifications table indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Certificates table indexes
CREATE INDEX idx_certificates_student_id ON certificates(student_id);
CREATE INDEX idx_certificates_course_id ON certificates(course_id);
CREATE INDEX idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_verification_code ON certificates(verification_code);

-- Announcements table indexes
CREATE INDEX idx_announcements_created_by ON announcements(created_by);
CREATE INDEX idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX idx_announcements_is_published ON announcements(is_published);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

-- Support Tickets table indexes
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);

-- Chatbot FAQs table indexes
CREATE INDEX idx_chatbot_faqs_category ON chatbot_faqs(category);
CREATE INDEX idx_chatbot_faqs_keywords ON chatbot_faqs USING GIN(keywords);
CREATE INDEX idx_chatbot_faqs_is_active ON chatbot_faqs(is_active);
CREATE INDEX idx_chatbot_faqs_usage_count ON chatbot_faqs(usage_count);

-- Composite indexes for common queries
CREATE INDEX idx_enrollments_student_status ON enrollments(student_id, status);
CREATE INDEX idx_progress_student_lesson ON progress_tracking(student_id, lesson_id);
CREATE INDEX idx_courses_published_category ON courses(is_published, category);
CREATE INDEX idx_lessons_section_order ON lessons(section_id, order_index);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- Full-text search indexes
CREATE INDEX idx_courses_title_search ON courses USING GIN(to_tsvector('english', title));
CREATE INDEX idx_courses_description_search ON courses USING GIN(to_tsvector('english', description));
CREATE INDEX idx_lessons_title_search ON lessons USING GIN(to_tsvector('english', title));
CREATE INDEX idx_chatbot_faqs_search ON chatbot_faqs USING GIN(to_tsvector('english', question || ' ' || answer));