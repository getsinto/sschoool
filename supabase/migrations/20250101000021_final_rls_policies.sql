-- ============================================================================
-- FINAL RLS POLICIES - For integration and analytics tables
-- Version: 1.0.0
-- Description: Security policies for final missing tables
-- ============================================================================

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE _migrations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER INTEGRATIONS POLICIES
-- ============================================================================

-- Users can view own integrations
CREATE POLICY "Users can view own integrations" ON user_integrations
    FOR SELECT USING (user_id = auth.uid());

-- Users can create own integrations
CREATE POLICY "Users can create own integrations" ON user_integrations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update own integrations
CREATE POLICY "Users can update own integrations" ON user_integrations
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete own integrations
CREATE POLICY "Users can delete own integrations" ON user_integrations
    FOR DELETE USING (user_id = auth.uid());

-- Admins can view all integrations
CREATE POLICY "Admins can view all integrations" ON user_integrations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Teachers can view student profiles in their courses
CREATE POLICY "Teachers can view student profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN teachers t ON t.user_id = u.id
            WHERE u.id = auth.uid() AND u.role = 'teacher'
        )
    );

-- ============================================================================
-- USER NOTIFICATION PREFERENCES POLICIES
-- ============================================================================

-- Users can manage own notification preferences
CREATE POLICY "Users can manage own notification preferences" ON user_notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Admins can view all preferences
CREATE POLICY "Admins can view all notification preferences" ON user_notification_preferences
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- NOTIFICATION DELIVERY LOG POLICIES
-- ============================================================================

-- Users can view own delivery logs
CREATE POLICY "Users can view own delivery logs" ON notification_delivery_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM notifications 
            WHERE id = notification_id 
            AND user_id = auth.uid()
        )
    );

-- Admins can view all delivery logs
CREATE POLICY "Admins can view all delivery logs" ON notification_delivery_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- System can insert delivery logs
CREATE POLICY "System can insert delivery logs" ON notification_delivery_log
    FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- EMAIL JOBS POLICIES (Admin only)
-- ============================================================================

-- Admins can manage email jobs
CREATE POLICY "Admins can manage email jobs" ON email_jobs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- System can insert email jobs
CREATE POLICY "System can insert email jobs" ON email_jobs
    FOR INSERT WITH CHECK (TRUE);

-- System can update email jobs
CREATE POLICY "System can update email jobs" ON email_jobs
    FOR UPDATE USING (TRUE);

-- ============================================================================
-- EMAIL ANALYTICS POLICIES (Admin only)
-- ============================================================================

-- Admins can view email analytics
CREATE POLICY "Admins can view email analytics" ON email_analytics
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- System can manage email analytics
CREATE POLICY "System can manage email analytics" ON email_analytics
    FOR ALL USING (TRUE);

-- ============================================================================
-- MIGRATIONS POLICIES (Admin only)
-- ============================================================================

-- Admins can view migrations
CREATE POLICY "Admins can view migrations" ON _migrations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- System can insert migrations
CREATE POLICY "System can insert migrations" ON _migrations
    FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE TRIGGER update_user_integrations_updated_at
    BEFORE UPDATE ON user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sync profiles with users table
CREATE OR REPLACE FUNCTION sync_user_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role, profile_pic, phone)
    VALUES (NEW.id, NEW.email, NEW.full_name, NEW.role, NEW.profile_pic, NEW.phone)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        profile_pic = EXCLUDED.profile_pic,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_user_to_profile_trigger
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_profile();

-- Comments
COMMENT ON POLICY "Users can view own integrations" ON user_integrations IS 'Users can view their OAuth integrations';
COMMENT ON POLICY "Users can manage own notification preferences" ON user_notification_preferences IS 'Users control their notification delivery preferences';
COMMENT ON POLICY "System can insert delivery logs" ON notification_delivery_log IS 'System logs all notification delivery attempts';
COMMENT ON FUNCTION sync_user_to_profile() IS 'Automatically syncs user data to profiles table';
