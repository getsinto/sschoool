-- ============================================================================
-- DATABASE TRIGGERS - Automated triggers
-- Version: 1.0.0
-- Description: Triggers for automatic timestamp updates
-- ============================================================================

-- Users table trigger
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Teachers table trigger
CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Students table trigger
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Parents table trigger
CREATE TRIGGER update_parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Courses table trigger
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Payments table trigger
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Subscriptions table trigger
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Refunds table trigger
CREATE TRIGGER update_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Progress tracking table trigger
CREATE TRIGGER update_progress_tracking_updated_at
    BEFORE UPDATE ON progress_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notifications table trigger
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notification preferences table trigger
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Push subscriptions table trigger
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Support tickets table trigger
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Chatbot FAQ table trigger
CREATE TRIGGER update_chatbot_faq_updated_at
    BEFORE UPDATE ON chatbot_faq
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Chatbot conversations table trigger
CREATE TRIGGER update_chatbot_conversations_updated_at
    BEFORE UPDATE ON chatbot_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Content folders table trigger
CREATE TRIGGER update_content_folders_updated_at
    BEFORE UPDATE ON content_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Content files table trigger
CREATE TRIGGER update_content_files_updated_at
    BEFORE UPDATE ON content_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Content categories table trigger
CREATE TRIGGER update_content_categories_updated_at
    BEFORE UPDATE ON content_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Subjects table trigger
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Teacher subjects table trigger
CREATE TRIGGER update_teacher_subjects_updated_at
    BEFORE UPDATE ON teacher_subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Custom subject requests table trigger
CREATE TRIGGER update_custom_subject_requests_updated_at
    BEFORE UPDATE ON custom_subject_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Student notes table trigger
CREATE TRIGGER update_student_notes_updated_at
    BEFORE UPDATE ON student_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TRIGGER update_users_updated_at ON users IS 'Auto-update updated_at timestamp';
COMMENT ON TRIGGER update_courses_updated_at ON courses IS 'Auto-update updated_at timestamp';
COMMENT ON TRIGGER update_payments_updated_at ON payments IS 'Auto-update updated_at timestamp';
