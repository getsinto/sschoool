-- ============================================================================
-- FIX NOTIFICATIONS RLS AND PERMISSIONS
-- Version: 1.0.0
-- Description: Fix permission denied errors for notifications table
-- ============================================================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE 
    USING (user_id = auth.uid());

-- Allow authenticated users to insert notifications (for system-generated notifications)
CREATE POLICY "Authenticated users can insert notifications" ON notifications
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow service role to bypass RLS for system operations
-- This is handled automatically by Supabase when using service role key

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT USAGE ON SEQUENCE notifications_id_seq TO authenticated;

-- Grant permissions for notification preferences
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT USAGE ON SEQUENCE notification_preferences_id_seq TO authenticated;

-- Grant permissions for push subscriptions
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
GRANT USAGE ON SEQUENCE push_subscriptions_id_seq TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add index for better performance on user_id queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);

-- Comments
COMMENT ON POLICY "Users can view own notifications" ON notifications IS 'Users can view their own notifications';
COMMENT ON POLICY "Users can update own notifications" ON notifications IS 'Users can mark their notifications as read';
COMMENT ON POLICY "Users can delete own notifications" ON notifications IS 'Users can delete their own notifications';
COMMENT ON POLICY "Authenticated users can insert notifications" ON notifications IS 'System can create notifications for users';

