-- Triggers for the online education platform

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON progress_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.certificate_number = 'CERT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('certificate_seq')::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for certificate numbers
CREATE SEQUENCE certificate_seq START 1;

-- Trigger for certificate number generation
CREATE TRIGGER generate_certificate_number_trigger BEFORE INSERT ON certificates
    FOR EACH ROW EXECUTE FUNCTION generate_certificate_number();

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.verification_code = upper(substring(md5(random()::text) from 1 for 8));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for verification code generation
CREATE TRIGGER generate_verification_code_trigger BEFORE INSERT ON certificates
    FOR EACH ROW EXECUTE FUNCTION generate_verification_code();

-- Function to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE courses 
        SET enrollments_count = enrollments_count + 1 
        WHERE id = NEW.course_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE courses 
        SET enrollments_count = enrollments_count - 1 
        WHERE id = OLD.course_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for enrollment count
CREATE TRIGGER update_enrollment_count_trigger
    AFTER INSERT OR DELETE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count();

-- Function to update coupon usage count
CREATE OR REPLACE FUNCTION update_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.coupon_id IS NOT NULL AND NEW.status = 'completed' THEN
        UPDATE coupons 
        SET used_count = used_count + 1 
        WHERE id = NEW.coupon_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for coupon usage
CREATE TRIGGER update_coupon_usage_trigger
    AFTER UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_coupon_usage();

-- Function to update FAQ usage count
CREATE OR REPLACE FUNCTION update_faq_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chatbot_faqs 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.faq_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to auto-approve teacher after profile completion
CREATE OR REPLACE FUNCTION check_teacher_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.qualifications IS NOT NULL 
       AND NEW.field_of_study IS NOT NULL 
       AND NEW.experience_years IS NOT NULL 
       AND NEW.bio IS NOT NULL 
       AND NEW.resume_url IS NOT NULL 
       AND OLD.is_approved = FALSE THEN
        NEW.is_approved = TRUE;
        NEW.approval_date = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for teacher auto-approval
CREATE TRIGGER check_teacher_approval_trigger BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION check_teacher_approval();

-- Function to create user profile based on role
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'teacher' THEN
        INSERT INTO teachers (user_id) VALUES (NEW.id);
    ELSIF NEW.role = 'student' THEN
        INSERT INTO students (user_id) VALUES (NEW.id);
    ELSIF NEW.role = 'parent' THEN
        INSERT INTO parents (user_id) VALUES (NEW.id);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user profile creation
CREATE TRIGGER create_user_profile_trigger AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to update last accessed time for enrollments
CREATE OR REPLACE FUNCTION update_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE enrollments 
    SET last_accessed_at = NOW() 
    WHERE student_id = NEW.student_id 
    AND course_id = (
        SELECT c.id FROM courses c
        JOIN sections s ON s.course_id = c.id
        JOIN lessons l ON l.section_id = s.id
        WHERE l.id = NEW.lesson_id
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for last accessed update
CREATE TRIGGER update_last_accessed_trigger
    AFTER INSERT OR UPDATE ON progress_tracking
    FOR EACH ROW EXECUTE FUNCTION update_last_accessed();

-- Function to calculate quiz score and percentage
CREATE OR REPLACE FUNCTION calculate_quiz_score()
RETURNS TRIGGER AS $$
DECLARE
    total_points INTEGER;
    earned_points INTEGER := 0;
    question_record RECORD;
BEGIN
    -- Get total points for the quiz
    SELECT SUM(points) INTO total_points
    FROM quiz_questions
    WHERE quiz_id = NEW.quiz_id;
    
    -- Calculate earned points based on answers
    FOR question_record IN 
        SELECT id, correct_answer, points 
        FROM quiz_questions 
        WHERE quiz_id = NEW.quiz_id
    LOOP
        IF (NEW.answers->question_record.id::text) = question_record.correct_answer THEN
            earned_points := earned_points + question_record.points;
        END IF;
    END LOOP;
    
    NEW.score := earned_points;
    NEW.percentage := CASE 
        WHEN total_points > 0 THEN (earned_points::DECIMAL / total_points) * 100
        ELSE 0
    END;
    
    -- Check if passed
    SELECT passing_score INTO NEW.passed
    FROM quizzes
    WHERE id = NEW.quiz_id
    AND NEW.percentage >= passing_score;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for quiz score calculation
CREATE TRIGGER calculate_quiz_score_trigger BEFORE INSERT ON quiz_attempts
    FOR EACH ROW EXECUTE FUNCTION calculate_quiz_score();