-- ============================================================================
-- ENUMS - Custom Types
-- Version: 1.0.0
-- Description: All ENUM types used across the database
-- ============================================================================

-- User and Role Types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'parent');
CREATE TYPE student_type AS ENUM ('online_school', 'spoken_english');
CREATE TYPE account_status_type AS ENUM ('pending_verification', 'pending_review', 'active', 'suspended', 'rejected');

-- Course Types
CREATE TYPE course_category AS ENUM ('online_school', 'spoken_english', 'tuition');
CREATE TYPE payment_model AS ENUM ('one_time', 'subscription', 'free');
CREATE TYPE lesson_type AS ENUM ('video', 'document', 'quiz', 'assignment', 'live_class');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Assessment Types
CREATE TYPE question_type AS ENUM ('mcq', 'true_false', 'short_answer', 'essay');
CREATE TYPE submission_type AS ENUM ('file', 'text', 'both');
CREATE TYPE submission_status AS ENUM ('pending', 'graded', 'late', 'rejected');

-- Payment Types
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_method AS ENUM ('stripe', 'paypal', 'razorpay', 'bank_transfer');

-- Status Types
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'suspended', 'cancelled');
CREATE TYPE class_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting', 'resolved', 'closed');

-- Platform and Integration Types
CREATE TYPE platform_type AS ENUM ('zoom', 'google_meet', 'custom');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'announcement');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE target_audience AS ENUM ('all', 'students', 'teachers', 'parents', 'admins');

-- Comments
COMMENT ON TYPE user_role IS 'User roles in the system';
COMMENT ON TYPE account_status_type IS 'Account verification and status states';
COMMENT ON TYPE course_category IS 'Course categories';
COMMENT ON TYPE lesson_type IS 'Types of lessons in a course';
COMMENT ON TYPE payment_status IS 'Payment transaction statuses';
COMMENT ON TYPE enrollment_status IS 'Student enrollment statuses';
