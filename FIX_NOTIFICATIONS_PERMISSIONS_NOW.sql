-- ============================================================================
-- EMERGENCY FIX: Notifications Permission Denied Error
-- Run this directly in Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;

-- Step 2: Recreate policies with proper permissions
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

CREATE POLICY "Authenticated users can insert notifications" ON notifications
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Step 3: Grant necessary table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO anon;

-- Step 4: Grant sequence permissions (if using serial/bigserial)
-- Note: UUID primary keys don't need sequence permissions
-- But if you have any sequences, grant them:
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 5: Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 6: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);

-- Step 7: Fix notification_preferences table
DROP POLICY IF EXISTS "Users can view own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON notification_preferences;

CREATE POLICY "Users can view own preferences" ON notification_preferences
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON notification_preferences
    FOR UPDATE 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences" ON notification_preferences
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Step 8: Fix push_subscriptions table
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;

CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Verification queries (run these to check if it worked)
-- SELECT * FROM notifications WHERE user_id = auth.uid() LIMIT 5;
-- SELECT COUNT(*) FROM notifications WHERE user_id = auth.uid() AND read = false;

