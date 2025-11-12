-- Database functions for the online education platform

-- Function to calculate course progress for a student
CREATE OR REPLACE FUNCTION calculate_course_progress(
    p_student_id UUID,
    p_course_id UUID
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress_percentage DECIMAL(5,2);
BEGIN
    -- Count total required lessons in the course
    SELECT COUNT(l.id) INTO total_lessons
    FROM lessons l
    JOIN sections s ON s.id = l.section_id
    WHERE s.course_id = p_course_id
    AND l.is_required = TRUE;
    
    -- Count completed lessons
    SELECT COUNT(pt.id) INTO completed_lessons
    FROM progress_tracking pt
    JOIN lessons l ON l.id = pt.lesson_id
    JOIN sections s ON s.id = l.section_id
    WHERE s.course_id = p_course_id
    AND pt.student_id = p_student_id
    AND pt.status = 'completed'
    AND l.is_required = TRUE;
    
    -- Calculate percentage
    IF total_lessons > 0 THEN
        progress_percentage := (completed_lessons::DECIMAL / total_lessons) * 100;
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Update enrollment progress
    UPDATE enrollments 
    SET completion_percentage = progress_percentage
    WHERE student_id = p_student_id AND course_id = p_course_id;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to get student dashboard stats
CREATE OR REPLACE FUNCTION get_student_dashboard_stats(p_student_id UUID)
RETURNS TABLE (
    total_courses INTEGER,
    active_courses INTEGER,
    completed_courses INTEGER,
    total_certificates INTEGER,
    avg_progress DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(e.id)::INTEGER as total_courses,
        COUNT(CASE WHEN e.status = 'active' THEN 1 END)::INTEGER as active_courses,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END)::INTEGER as completed_courses,
        COUNT(c.id)::INTEGER as total_certificates,
        COALESCE(AVG(e.completion_percentage), 0)::DECIMAL(5,2) as avg_progress
    FROM enrollments e
    LEFT JOIN certificates c ON c.student_id = e.student_id AND c.course_id = e.course_id
    WHERE e.student_id = p_student_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get teacher dashboard stats
CREATE OR REPLACE FUNCTION get_teacher_dashboard_stats(p_teacher_id UUID)
RETURNS TABLE (
    total_courses INTEGER,
    published_courses INTEGER,
    total_students INTEGER,
    total_revenue DECIMAL(10,2),
    avg_rating DECIMAL(3,2)
) AS $$
DECLARE
    teacher_user_id UUID;
BEGIN
    -- Get user_id from teacher_id
    SELECT user_id INTO teacher_user_id FROM teachers WHERE id = p_teacher_id;
    
    RETURN QUERY
    SELECT 
        COUNT(co.id)::INTEGER as total_courses,
        COUNT(CASE WHEN co.is_published = TRUE THEN 1 END)::INTEGER as published_courses,
        COUNT(DISTINCT e.student_id)::INTEGER as total_students,
        COALESCE(SUM(p.final_amount), 0)::DECIMAL(10,2) as total_revenue,
        0::DECIMAL(3,2) as avg_rating -- Placeholder for rating system
    FROM courses co
    LEFT JOIN enrollments e ON e.course_id = co.id
    LEFT JOIN payments p ON p.course_id = co.id AND p.status = 'completed'
    WHERE co.created_by = teacher_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check coupon validity
CREATE OR REPLACE FUNCTION is_coupon_valid(
    p_coupon_code TEXT,
    p_course_id UUID,
    p_purchase_amount DECIMAL(10,2)
)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_amount DECIMAL(10,2),
    error_message TEXT
) AS $$
DECLARE
    coupon_record RECORD;
    calculated_discount DECIMAL(10,2);
BEGIN
    -- Get coupon details
    SELECT * INTO coupon_record
    FROM coupons
    WHERE code = p_coupon_code
    AND is_active = TRUE;
    
    -- Check if coupon exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(10,2), 'Invalid coupon code';
        RETURN;
    END IF;
    
    -- Check validity dates
    IF coupon_record.valid_from > NOW() THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(10,2), 'Coupon not yet valid';
        RETURN;
    END IF;
    
    IF coupon_record.valid_until < NOW() THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(10,2), 'Coupon has expired';
        RETURN;
    END IF;
    
    -- Check usage limit
    IF coupon_record.usage_limit IS NOT NULL AND coupon_record.used_count >= coupon_record.usage_limit THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(10,2), 'Coupon usage limit exceeded';
        RETURN;
    END IF;
    
    -- Check minimum purchase amount
    IF p_purchase_amount < coupon_record.min_purchase_amount THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(10,2), 'Minimum purchase amount not met';
        RETURN;
    END IF;
    
    -- Check applicable courses
    IF coupon_record.applicable_courses IS NOT NULL 
       AND NOT (p_course_id = ANY(coupon_record.applicable_courses)) THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(10,2), 'Coupon not applicable to this course';
        RETURN;
    END IF;
    
    -- Calculate discount
    IF coupon_record.discount_type = 'percentage' THEN
        calculated_discount := (p_purchase_amount * coupon_record.discount_value) / 100;
    ELSE
        calculated_discount := coupon_record.discount_value;
    END IF;
    
    -- Ensure discount doesn't exceed purchase amount
    calculated_discount := LEAST(calculated_discount, p_purchase_amount);
    
    RETURN QUERY SELECT TRUE, calculated_discount, 'Valid coupon'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to get course with enrollment status
CREATE OR REPLACE FUNCTION get_course_with_enrollment(
    p_course_id UUID,
    p_student_id UUID DEFAULT NULL
)
RETURNS TABLE (
    course_id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL(10,2),
    thumbnail_url TEXT,
    is_enrolled BOOLEAN,
    enrollment_status enrollment_status,
    progress_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as course_id,
        c.title,
        c.description,
        c.price,
        c.thumbnail_url,
        CASE WHEN e.id IS NOT NULL THEN TRUE ELSE FALSE END as is_enrolled,
        e.status as enrollment_status,
        COALESCE(e.completion_percentage, 0) as progress_percentage
    FROM courses c
    LEFT JOIN enrollments e ON e.course_id = c.id 
        AND e.student_id = (SELECT id FROM students WHERE user_id = p_student_id)
    WHERE c.id = p_course_id;
END;
$$ LANGUAGE plpgsql;

-- Function to search courses
CREATE OR REPLACE FUNCTION search_courses(
    p_search_term TEXT DEFAULT NULL,
    p_category course_category DEFAULT NULL,
    p_grade_level TEXT DEFAULT NULL,
    p_min_price DECIMAL(10,2) DEFAULT NULL,
    p_max_price DECIMAL(10,2) DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category course_category,
    grade_level TEXT,
    subject TEXT,
    price DECIMAL(10,2),
    thumbnail_url TEXT,
    enrollments_count INTEGER,
    created_by_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.grade_level,
        c.subject,
        c.price,
        c.thumbnail_url,
        c.enrollments_count,
        u.full_name as created_by_name
    FROM courses c
    JOIN users u ON u.id = c.created_by
    WHERE c.is_published = TRUE
    AND (p_search_term IS NULL OR 
         c.title ILIKE '%' || p_search_term || '%' OR 
         c.description ILIKE '%' || p_search_term || '%')
    AND (p_category IS NULL OR c.category = p_category)
    AND (p_grade_level IS NULL OR c.grade_level = p_grade_level)
    AND (p_min_price IS NULL OR c.price >= p_min_price)
    AND (p_max_price IS NULL OR c.price <= p_max_price)
    ORDER BY c.enrollments_count DESC, c.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming live classes for a student
CREATE OR REPLACE FUNCTION get_upcoming_live_classes(p_student_id UUID)
RETURNS TABLE (
    class_id UUID,
    course_title TEXT,
    class_title TEXT,
    teacher_name TEXT,
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    platform platform_type,
    meeting_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lc.id as class_id,
        c.title as course_title,
        lc.title as class_title,
        u.full_name as teacher_name,
        lc.scheduled_at,
        lc.duration_minutes,
        lc.platform,
        lc.meeting_url
    FROM live_classes lc
    JOIN courses c ON c.id = lc.course_id
    JOIN teachers t ON t.id = lc.teacher_id
    JOIN users u ON u.id = t.user_id
    JOIN enrollments e ON e.course_id = c.id
    WHERE e.student_id = p_student_id
    AND lc.scheduled_at > NOW()
    AND lc.status = 'scheduled'
    ORDER BY lc.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to generate course completion certificate
CREATE OR REPLACE FUNCTION generate_certificate(
    p_student_id UUID,
    p_course_id UUID
)
RETURNS UUID AS $$
DECLARE
    certificate_id UUID;
    student_progress DECIMAL(5,2);
BEGIN
    -- Check if course is completed
    SELECT completion_percentage INTO student_progress
    FROM enrollments
    WHERE student_id = p_student_id AND course_id = p_course_id;
    
    IF student_progress < 100 THEN
        RAISE EXCEPTION 'Course not completed. Progress: %', student_progress;
    END IF;
    
    -- Check if certificate already exists
    SELECT id INTO certificate_id
    FROM certificates
    WHERE student_id = p_student_id AND course_id = p_course_id;
    
    IF certificate_id IS NOT NULL THEN
        RETURN certificate_id;
    END IF;
    
    -- Create new certificate
    INSERT INTO certificates (student_id, course_id)
    VALUES (p_student_id, p_course_id)
    RETURNING id INTO certificate_id;
    
    -- Update enrollment with certificate
    UPDATE enrollments
    SET status = 'completed',
        certificate_url = '/certificates/' || certificate_id
    WHERE student_id = p_student_id AND course_id = p_course_id;
    
    RETURN certificate_id;
END;
$$ LANGUAGE plpgsql;