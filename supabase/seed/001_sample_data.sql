-- Sample seed data for the online education platform

-- Insert sample users (these would normally be created through Supabase Auth)
-- Note: In production, users are created through auth.users table
INSERT INTO users (id, email, role, full_name, last_name, is_verified, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@stharoonschool.com', 'admin', 'System', 'Administrator', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'john.teacher@stharoonschool.com', 'teacher', 'John', 'Smith', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'jane.teacher@stharoonschool.com', 'teacher', 'Jane', 'Doe', true, true),
('550e8400-e29b-41d4-a716-446655440004', 'alice.student@stharoonschool.com', 'student', 'Alice', 'Johnson', true, true),
('550e8400-e29b-41d4-a716-446655440005', 'bob.student@stharoonschool.com', 'student', 'Bob', 'Wilson', true, true),
('550e8400-e29b-41d4-a716-446655440006', 'parent.alice@stharoonschool.com', 'parent', 'Robert', 'Johnson', true, true);

-- Insert sample teachers
INSERT INTO teachers (user_id, qualifications, field_of_study, experience_years, subjects, bio, is_approved) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'M.Ed in Mathematics', 'Mathematics Education', 8, ARRAY['Mathematics', 'Physics'], 'Experienced mathematics teacher with passion for online education.', true),
('550e8400-e29b-41d4-a716-446655440003', 'M.A in English Literature', 'English Literature', 5, ARRAY['English', 'Literature'], 'English literature expert specializing in spoken English and writing skills.', true);

-- Insert sample parents
INSERT INTO parents (user_id, relationship, occupation) VALUES
('550e8400-e29b-41d4-a716-446655440006', 'Father', 'Software Engineer');

-- Insert sample students
INSERT INTO students (user_id, student_type, grade_level, academic_year, english_level, parent_id) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'online_school', 'Grade 10', '2024-25', 'Intermediate', (SELECT id FROM parents WHERE user_id = '550e8400-e29b-41d4-a716-446655440006')),
('550e8400-e29b-41d4-a716-446655440005', 'spoken_english', 'Grade 12', '2024-25', 'Beginner', NULL);

-- Update parent with linked students
UPDATE parents 
SET linked_students = ARRAY[(SELECT id FROM students WHERE user_id = '550e8400-e29b-41d4-a716-446655440004')]
WHERE user_id = '550e8400-e29b-41d4-a716-446655440006';

-- Insert sample courses
INSERT INTO courses (title, slug, description, category, grade_level, subject, price, payment_model, created_by, is_published) VALUES
('Advanced Mathematics for Grade 10', 'advanced-math-grade-10', 'Comprehensive mathematics course covering algebra, geometry, and trigonometry for Grade 10 students.', 'online_school', 'Grade 10', 'Mathematics', 299.99, 'one_time', '550e8400-e29b-41d4-a716-446655440002', true),
('Spoken English Mastery', 'spoken-english-mastery', 'Complete spoken English course for beginners to advanced learners.', 'spoken_english', 'All Levels', 'English', 199.99, 'subscription', '550e8400-e29b-41d4-a716-446655440003', true),
('Physics Fundamentals', 'physics-fundamentals', 'Basic physics concepts and principles for high school students.', 'online_school', 'Grade 11', 'Physics', 249.99, 'one_time', '550e8400-e29b-41d4-a716-446655440002', true);

-- Insert sample sections
INSERT INTO sections (course_id, title, order_index) VALUES
((SELECT id FROM courses WHERE slug = 'advanced-math-grade-10'), 'Introduction to Algebra', 1),
((SELECT id FROM courses WHERE slug = 'advanced-math-grade-10'), 'Geometry Basics', 2),
((SELECT id FROM courses WHERE slug = 'advanced-math-grade-10'), 'Trigonometry', 3),
((SELECT id FROM courses WHERE slug = 'spoken-english-mastery'), 'Basic Pronunciation', 1),
((SELECT id FROM courses WHERE slug = 'spoken-english-mastery'), 'Grammar Essentials', 2),
((SELECT id FROM courses WHERE slug = 'spoken-english-mastery'), 'Conversation Practice', 3);

-- Insert sample lessons
INSERT INTO lessons (section_id, title, description, lesson_type, duration_minutes, is_free_preview, order_index) VALUES
-- Math course lessons
((SELECT id FROM sections WHERE title = 'Introduction to Algebra' LIMIT 1), 'What is Algebra?', 'Introduction to algebraic concepts and variables', 'video', 30, true, 1),
((SELECT id FROM sections WHERE title = 'Introduction to Algebra' LIMIT 1), 'Linear Equations', 'Solving linear equations step by step', 'video', 45, false, 2),
((SELECT id FROM sections WHERE title = 'Introduction to Algebra' LIMIT 1), 'Practice Problems', 'Solve algebra problems', 'quiz', 20, false, 3),
-- English course lessons
((SELECT id FROM sections WHERE title = 'Basic Pronunciation' LIMIT 1), 'English Sounds', 'Learn basic English phonetics', 'video', 25, true, 1),
((SELECT id FROM sections WHERE title = 'Basic Pronunciation' LIMIT 1), 'Vowel Sounds', 'Master English vowel pronunciation', 'video', 30, false, 2),
((SELECT id FROM sections WHERE title = 'Grammar Essentials' LIMIT 1), 'Parts of Speech', 'Understanding nouns, verbs, adjectives', 'video', 35, false, 1);

-- Insert sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, usage_limit, valid_from, valid_until, is_active) VALUES
('WELCOME20', 'percentage', 20, 100, 100, NOW(), NOW() + INTERVAL '30 days', true),
('STUDENT50', 'fixed', 50, 200, 50, NOW(), NOW() + INTERVAL '60 days', true),
('EARLYBIRD', 'percentage', 15, 150, 200, NOW(), NOW() + INTERVAL '45 days', true);

-- Insert sample payments
INSERT INTO payments (user_id, course_id, amount, currency, payment_gateway, transaction_id, final_amount, status, payment_date) VALUES
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM courses WHERE slug = 'advanced-math-grade-10'), 299.99, 'USD', 'stripe', 'txn_1234567890', 299.99, 'completed', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM courses WHERE slug = 'spoken-english-mastery'), 199.99, 'USD', 'paypal', 'pp_1234567890', 199.99, 'completed', NOW() - INTERVAL '3 days');

-- Insert sample enrollments
INSERT INTO enrollments (student_id, course_id, enrollment_date, completion_percentage, status, payment_id) VALUES
((SELECT id FROM students WHERE user_id = '550e8400-e29b-41d4-a716-446655440004'), (SELECT id FROM courses WHERE slug = 'advanced-math-grade-10'), NOW() - INTERVAL '5 days', 25.5, 'active', (SELECT id FROM payments WHERE transaction_id = 'txn_1234567890')),
((SELECT id FROM students WHERE user_id = '550e8400-e29b-41d4-a716-446655440005'), (SELECT id FROM courses WHERE slug = 'spoken-english-mastery'), NOW() - INTERVAL '3 days', 15.0, 'active', (SELECT id FROM payments WHERE transaction_id = 'pp_1234567890'));

-- Insert sample progress tracking
INSERT INTO progress_tracking (student_id, lesson_id, status, watch_percentage, completed_at) VALUES
((SELECT id FROM students WHERE user_id = '550e8400-e29b-41d4-a716-446655440004'), (SELECT id FROM lessons WHERE title = 'What is Algebra?' LIMIT 1), 'completed', 100, NOW() - INTERVAL '4 days'),
((SELECT id FROM students WHERE user_id = '550e8400-e29b-41d4-a716-446655440004'), (SELECT id FROM lessons WHERE title = 'Linear Equations' LIMIT 1), 'in_progress', 65, NULL),
((SELECT id FROM students WHERE user_id = '550e8400-e29b-41d4-a716-446655440005'), (SELECT id FROM lessons WHERE title = 'English Sounds' LIMIT 1), 'completed', 100, NOW() - INTERVAL '2 days');

-- Insert sample quizzes
INSERT INTO quizzes (lesson_id, title, description, duration_minutes, passing_score, max_attempts) VALUES
((SELECT id FROM lessons WHERE title = 'Practice Problems' LIMIT 1), 'Algebra Basics Quiz', 'Test your understanding of basic algebra', 15, 70, 3);

-- Insert sample quiz questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index) VALUES
((SELECT id FROM quizzes WHERE title = 'Algebra Basics Quiz'), 'What is the value of x in the equation 2x + 5 = 15?', 'mcq', '{"A": "5", "B": "10", "C": "7.5", "D": "15"}', 'A', 2, 1),
((SELECT id FROM quizzes WHERE title = 'Algebra Basics Quiz'), 'Is algebra a branch of mathematics?', 'true_false', '{"true": "True", "false": "False"}', 'true', 1, 2);

-- Insert sample live classes
INSERT INTO live_classes (course_id, teacher_id, title, description, platform, scheduled_at, duration_minutes, status) VALUES
((SELECT id FROM courses WHERE slug = 'advanced-math-grade-10'), (SELECT id FROM teachers WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'), 'Live Q&A Session - Algebra', 'Interactive session to solve algebra doubts', 'zoom', NOW() + INTERVAL '2 days', 60, 'scheduled'),
((SELECT id FROM courses WHERE slug = 'spoken-english-mastery'), (SELECT id FROM teachers WHERE user_id = '550e8400-e29b-41d4-a716-446655440003'), 'Pronunciation Practice Session', 'Live pronunciation practice with feedback', 'google_meet', NOW() + INTERVAL '3 days', 45, 'scheduled');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Welcome to Advanced Mathematics!', 'You have successfully enrolled in the Advanced Mathematics course. Start learning now!', 'success', false),
('550e8400-e29b-41d4-a716-446655440005', 'Upcoming Live Class', 'You have a live pronunciation practice session scheduled for tomorrow at 3 PM.', 'info', false),
('550e8400-e29b-41d4-a716-446655440004', 'Quiz Available', 'A new quiz is available in your Algebra course. Test your knowledge!', 'info', true);

-- Insert sample announcements
INSERT INTO announcements (created_by, title, message, target_audience, is_published, published_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Welcome to St Haroon Online School!', 'We are excited to have you join our online learning community. Explore our courses and start your learning journey today!', 'all', true, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440001', 'New Course Alert: Physics Fundamentals', 'We have launched a new Physics course for Grade 11 students. Enroll now and get 20% off!', 'students', true, NOW() - INTERVAL '2 hours');

-- Insert sample support tickets
INSERT INTO support_tickets (user_id, subject, message, priority, status) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Video not playing', 'I am unable to play the video in lesson 2 of the algebra course. Please help.', 'medium', 'open'),
('550e8400-e29b-41d4-a716-446655440005', 'Payment issue', 'My payment was deducted but I did not receive access to the course.', 'high', 'in_progress');

-- Insert sample chatbot FAQs
INSERT INTO chatbot_faqs (question, answer, category, keywords, is_active) VALUES
('How do I enroll in a course?', 'To enroll in a course, browse our course catalog, select the course you want, and click the "Enroll Now" button. You will be guided through the payment process.', 'enrollment', ARRAY['enroll', 'course', 'registration', 'signup'], true),
('Can I get a refund?', 'Yes, we offer a 30-day money-back guarantee. If you are not satisfied with the course, you can request a refund within 30 days of purchase.', 'payment', ARRAY['refund', 'money back', 'return'], true),
('How do I access live classes?', 'Live classes can be accessed from your dashboard. You will receive a notification before each live class with the meeting link.', 'live_classes', ARRAY['live class', 'zoom', 'meeting', 'schedule'], true),
('What if I miss a live class?', 'Don''t worry! All live classes are recorded and available in your course materials within 24 hours of the session.', 'live_classes', ARRAY['miss', 'recording', 'replay'], true);

-- Insert sample assignments
INSERT INTO assignments (lesson_id, title, instructions, due_date, max_points, submission_type) VALUES
((SELECT id FROM lessons WHERE title = 'Linear Equations' LIMIT 1), 'Solve Linear Equations', 'Solve the given set of linear equations and show your work step by step.', NOW() + INTERVAL '7 days', 100, 'both');

-- Update course enrollment counts
UPDATE courses SET enrollments_count = (
    SELECT COUNT(*) FROM enrollments WHERE course_id = courses.id
);

-- Update course views count (sample data)
UPDATE courses SET views_count = FLOOR(RANDOM() * 1000) + 100;