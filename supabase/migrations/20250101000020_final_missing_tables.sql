-- ============================================================================
-- FINAL MISSING TABLES - Additional tables found in lib files
-- Version: 1.0.0
-- Description: Integration tables, analytics, delivery logs
-- ============================================================================

-- User Integrations Table (for Google Meet, Zoom OAuth)
CREATE TABLE IF NOT EXISTS user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'zoom', 'microsoft')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expiry TIMESTAMPTZ NOT NULL,
    scopes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Profiles Table (referenced in support notifications)
-- Note: This might be a view or alias of users table, but adding for safety
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL,
    profile_pic TEXT,
    bio TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Notification Preferences Table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- Notification Delivery Log Table
CREATE TABLE IF NOT EXISTS notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('in_app', 'email', 'push', 'sms')),
    status TEXT NOT NULL CHECK (status IN ('delivered', 'sent', 'failed', 'pending')),
    error_message TEXT,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Jobs Table (for email queue processing)
CREATE TABLE IF NOT EXISTS email_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT,
    template_data JSONB DEFAULT '{}',
    html_content TEXT,
    text_content TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Analytics Table
CREATE TABLE IF NOT EXISTS email_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_job_id UUID UNIQUE NOT NULL REFERENCES email_jobs(id) ON DELETE CASCADE,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    bounce_type TEXT CHECK (bounce_type IN ('hard', 'soft')),
    bounce_reason TEXT,
    unsubscribed_at TIMESTAMPTZ,
    complained_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrations Tracking Table (for migration scripts)
CREATE TABLE IF NOT EXISTS _migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing column to live_classes for attendance sync tracking
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS attendance_synced BOOLEAN DEFAULT FALSE;

-- Add missing column to live_classes for Google Meet event ID
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Add missing column to live_classes for join URL
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS join_url TEXT;

-- Add missing column to class_attendance for meeting_id
ALTER TABLE class_attendance ADD COLUMN IF NOT EXISTS meeting_id TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON user_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_user_integrations_active ON user_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_method ON notification_delivery_log(delivery_method);
CREATE INDEX IF NOT EXISTS idx_email_jobs_status ON email_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_jobs_scheduled_at ON email_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_analytics_email_job_id ON email_analytics(email_job_id);
CREATE INDEX IF NOT EXISTS idx_migrations_name ON _migrations(name);

-- Comments
COMMENT ON TABLE user_integrations IS 'OAuth integrations for Google Meet, Zoom, etc.';
COMMENT ON TABLE profiles IS 'User profile information (may be view of users table)';
COMMENT ON TABLE user_notification_preferences IS 'User preferences for notification delivery methods';
COMMENT ON TABLE notification_delivery_log IS 'Log of notification delivery attempts';
COMMENT ON TABLE email_jobs IS 'Queue for outgoing emails';
COMMENT ON TABLE email_analytics IS 'Email delivery and engagement analytics';
COMMENT ON TABLE _migrations IS 'Tracks executed database migrations';
COMMENT ON COLUMN live_classes.attendance_synced IS 'Whether attendance has been synced from meeting platform';
COMMENT ON COLUMN live_classes.google_event_id IS 'Google Calendar event ID for Google Meet integration';
COMMENT ON COLUMN live_classes.join_url IS 'Direct join URL for the meeting';
COMMENT ON COLUMN class_attendance.meeting_id IS 'Meeting ID from video platform (Zoom/Google Meet)';
