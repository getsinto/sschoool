-- ============================================================================
-- RLS POLICIES FOR CRITICAL MISSING TABLES
-- Version: 1.0.0
-- Description: Security policies for newly added tables
-- ============================================================================

-- Enable RLS
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MEETING PARTICIPANTS POLICIES
-- ============================================================================

-- Teachers and admins can view all participants
CREATE POLICY "Teachers and admins can view meeting participants" ON meeting_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- System can insert participant records (from webhooks)
CREATE POLICY "System can insert meeting participants" ON meeting_participants
    FOR INSERT WITH CHECK (TRUE);

-- System can update participant records (from webhooks)
CREATE POLICY "System can update meeting participants" ON meeting_participants
    FOR UPDATE USING (TRUE);

-- ============================================================================
-- TICKET SURVEYS POLICIES
-- ============================================================================

-- Users can view their own surveys
CREATE POLICY "Users can view own ticket surveys" ON ticket_surveys
    FOR SELECT USING (user_id = auth.uid());

-- Users can create surveys for their tickets
CREATE POLICY "Users can create ticket surveys" ON ticket_surveys
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE id = ticket_id 
            AND user_id = auth.uid()
        )
    );

-- Users can update their own surveys
CREATE POLICY "Users can update own ticket surveys" ON ticket_surveys
    FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all surveys
CREATE POLICY "Admins can view all ticket surveys" ON ticket_surveys
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- TICKET MESSAGES POLICIES
-- ============================================================================

-- Users can view messages for their tickets
CREATE POLICY "Users can view ticket messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE id = ticket_id 
            AND user_id = auth.uid()
        )
    );

-- Users can create messages for their tickets
CREATE POLICY "Users can create ticket messages" ON ticket_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE id = ticket_id 
            AND user_id = auth.uid()
        )
    );

-- Staff can view all messages
CREATE POLICY "Staff can view all ticket messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

-- Staff can create messages
CREATE POLICY "Staff can create ticket messages" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

-- ============================================================================
-- TICKET REPLIES POLICIES
-- ============================================================================

-- Users can view replies for their tickets
CREATE POLICY "Users can view ticket replies" ON ticket_replies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE id = ticket_id 
            AND user_id = auth.uid()
        )
    );

-- Users can create replies for their tickets
CREATE POLICY "Users can create ticket replies" ON ticket_replies
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE id = ticket_id 
            AND user_id = auth.uid()
        )
    );

-- Staff can view all replies
CREATE POLICY "Staff can view all ticket replies" ON ticket_replies
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

-- Staff can create replies
CREATE POLICY "Staff can create ticket replies" ON ticket_replies
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

-- ============================================================================
-- TICKET ATTACHMENTS POLICIES
-- ============================================================================

-- Users can view attachments for their tickets
CREATE POLICY "Users can view ticket attachments" ON ticket_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE id = ticket_id 
            AND user_id = auth.uid()
        )
    );

-- Users can upload attachments for their tickets
CREATE POLICY "Users can upload ticket attachments" ON ticket_attachments
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE id = ticket_id 
            AND user_id = auth.uid()
        )
    );

-- Staff can view all attachments
CREATE POLICY "Staff can view all ticket attachments" ON ticket_attachments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

-- Staff can upload attachments
CREATE POLICY "Staff can upload ticket attachments" ON ticket_attachments
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update ticket timestamp when message is added
CREATE OR REPLACE FUNCTION update_ticket_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE support_tickets 
    SET updated_at = NOW() 
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_message_update_trigger
    AFTER INSERT ON ticket_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_on_message();

CREATE TRIGGER ticket_reply_update_trigger
    AFTER INSERT ON ticket_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_on_message();

-- Comments
COMMENT ON POLICY "Teachers and admins can view meeting participants" ON meeting_participants IS 'Teachers and admins can track meeting attendance';
COMMENT ON POLICY "Users can view own ticket surveys" ON ticket_surveys IS 'Users can view their satisfaction survey responses';
COMMENT ON POLICY "Users can view ticket messages" ON ticket_messages IS 'Users can view messages in their support tickets';
COMMENT ON FUNCTION update_ticket_on_message() IS 'Updates ticket timestamp when new message is added';
