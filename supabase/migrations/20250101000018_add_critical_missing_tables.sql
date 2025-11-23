-- ============================================================================
-- CRITICAL MISSING TABLES - Additional tables found in API routes
-- Version: 1.0.0
-- Description: Tables referenced in code but missing from schema
-- ============================================================================

-- Meeting Participants Table (for Zoom/Google Meet tracking)
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id TEXT NOT NULL,
    participant_id TEXT,
    user_email TEXT,
    user_name TEXT,
    join_time TIMESTAMPTZ NOT NULL,
    leave_time TIMESTAMPTZ,
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Surveys Table (for satisfaction surveys)
CREATE TABLE IF NOT EXISTS ticket_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID UNIQUE NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    satisfaction TEXT CHECK (satisfaction IN ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied')),
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Messages Table (different from support_ticket_messages)
-- This is used in close/reply routes
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_staff BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Replies Table (for threaded conversations)
CREATE TABLE IF NOT EXISTS ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_staff BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Attachments Table (simplified version)
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES ticket_replies(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to support_tickets
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS survey_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Add missing columns to live_classes for recording status
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS recording_status TEXT CHECK (recording_status IN ('not_started', 'recording', 'stopped', 'processing', 'available'));
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_email ON meeting_participants(user_email);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_join_time ON meeting_participants(join_time);
CREATE INDEX IF NOT EXISTS idx_ticket_surveys_ticket_id ON ticket_surveys(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_surveys_user_id ON ticket_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_user_id ON ticket_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_user_id ON ticket_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_reply_id ON ticket_attachments(reply_id);

-- Comments
COMMENT ON TABLE meeting_participants IS 'Tracks participants joining/leaving Zoom/Google Meet sessions';
COMMENT ON TABLE ticket_surveys IS 'Customer satisfaction surveys for support tickets';
COMMENT ON TABLE ticket_messages IS 'Messages and replies within support tickets';
COMMENT ON TABLE ticket_replies IS 'Threaded replies to support tickets';
COMMENT ON TABLE ticket_attachments IS 'File attachments for ticket messages and replies';
COMMENT ON COLUMN support_tickets.survey_completed IS 'Whether user has completed satisfaction survey';
COMMENT ON COLUMN support_tickets.closed_at IS 'Timestamp when ticket was closed';
COMMENT ON COLUMN live_classes.recording_status IS 'Current status of class recording';
COMMENT ON COLUMN live_classes.actual_start_time IS 'Actual time class started (from webhook)';
COMMENT ON COLUMN live_classes.actual_end_time IS 'Actual time class ended (from webhook)';
