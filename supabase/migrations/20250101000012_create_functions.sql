-- ============================================================================
-- DATABASE FUNCTIONS - Utility functions
-- Version: 1.0.0
-- Description: Reusable database functions
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Function: Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = user_uuid
          AND read = FALSE
          AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_uuid UUID)
RETURNS INTEGER AS $
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications
    SET read = TRUE, 
        read_at = NOW(), 
        updated_at = NOW()
    WHERE user_id = user_uuid
      AND read = FALSE
      AND (expires_at IS NULL OR expires_at > NOW());
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check verification time elapsed
CREATE OR REPLACE FUNCTION check_verification_time_elapsed(user_uuid UUID)
RETURNS BOOLEAN AS $
DECLARE
    verification_time TIMESTAMPTZ;
    user_role_val TEXT;
    hours_elapsed NUMERIC;
BEGIN
    SELECT verification_requested_at, role::TEXT INTO verification_time, user_role_val
    FROM users WHERE id = user_uuid;
    
    IF verification_time IS NULL THEN
        RETURN FALSE;
    END IF;
    
    hours_elapsed := EXTRACT(EPOCH FROM (NOW() - verification_time)) / 3600;
    
    CASE user_role_val
        WHEN 'teacher' THEN
            RETURN hours_elapsed >= 48;
        WHEN 'student', 'parent' THEN
            RETURN hours_elapsed >= 24;
        ELSE
            RETURN hours_elapsed >= 24;
    END CASE;
END;
$ LANGUAGE plpgsql;

-- Function: Get teacher subjects with details
CREATE OR REPLACE FUNCTION get_teacher_subjects(p_teacher_id UUID)
RETURNS TABLE(
    subject_id UUID,
    subject_name TEXT,
    subject_category TEXT,
    is_primary BOOLEAN,
    proficiency_level TEXT,
    years_experience INTEGER,
    status TEXT,
    approved_at TIMESTAMPTZ
) AS $
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.category,
        ts.is_primary,
        ts.proficiency_level,
        ts.years_experience,
        ts.status,
        ts.approved_at
    FROM teacher_subjects ts
    JOIN subjects s ON s.id = ts.subject_id
    WHERE ts.teacher_id = p_teacher_id
    ORDER BY ts.is_primary DESC, s.name;
END;
$ LANGUAGE plpgsql;

-- Function: Increment file usage count
CREATE OR REPLACE FUNCTION increment_file_usage(file_uuid UUID)
RETURNS VOID AS $
BEGIN
    UPDATE content_files
    SET usage_count = usage_count + 1
    WHERE id = file_uuid;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get storage statistics
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
    total_files BIGINT,
    total_size BIGINT,
    videos_count BIGINT,
    videos_size BIGINT,
    documents_count BIGINT,
    documents_size BIGINT,
    images_count BIGINT,
    images_size BIGINT
) AS $
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_files,
        COALESCE(SUM(size), 0)::BIGINT as total_size,
        COUNT(*) FILTER (WHERE type = 'video')::BIGINT as videos_count,
        COALESCE(SUM(size) FILTER (WHERE type = 'video'), 0)::BIGINT as videos_size,
        COUNT(*) FILTER (WHERE type = 'document')::BIGINT as documents_count,
        COALESCE(SUM(size) FILTER (WHERE type = 'document'), 0)::BIGINT as documents_size,
        COUNT(*) FILTER (WHERE type = 'image')::BIGINT as images_count,
        COALESCE(SUM(size) FILTER (WHERE type = 'image'), 0)::BIGINT as images_size
    FROM content_files
    WHERE is_archived = FALSE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_verification_time_elapsed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_teacher_subjects(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_file_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_storage_stats() TO authenticated;

-- Comments
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp';
COMMENT ON FUNCTION get_unread_notification_count(UUID) IS 'Returns count of unread notifications for a user';
COMMENT ON FUNCTION mark_all_notifications_read(UUID) IS 'Marks all notifications as read for a user';
COMMENT ON FUNCTION check_verification_time_elapsed(UUID) IS 'Checks if verification time window has elapsed';
COMMENT ON FUNCTION get_teacher_subjects(UUID) IS 'Returns all subjects for a teacher with details';
COMMENT ON FUNCTION increment_file_usage(UUID) IS 'Increments usage count for a file';
COMMENT ON FUNCTION get_storage_stats() IS 'Returns storage statistics';
