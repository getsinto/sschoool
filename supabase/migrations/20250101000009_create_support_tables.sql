-- ============================================================================
-- SUPPORT TABLES - Support tickets and chatbot
-- Version: 1.0.0
-- Description: Support tickets, messages, chatbot FAQ
-- ============================================================================

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority priority_level DEFAULT 'medium',
    status ticket_status DEFAULT 'open',
    assigned_to UUID REFERENCES users(id),
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Ticket Messages Table
CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Ticket Attachments Table
CREATE TABLE IF NOT EXISTS support_ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES support_ticket_messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot FAQ Table
CREATE TABLE IF NOT EXISTS chatbot_faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    keywords TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot Conversations Table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]',
    escalated_to_ticket UUID REFERENCES support_tickets(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_attachments_ticket_id ON support_ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_faq_category ON chatbot_faq(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_faq_active ON chatbot_faq(is_active);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);

-- Full-text search for FAQ
CREATE INDEX IF NOT EXISTS idx_chatbot_faq_search ON chatbot_faq 
    USING GIN(to_tsvector('english', question || ' ' || answer));

-- Comments
COMMENT ON TABLE support_tickets IS 'Customer support tickets';
COMMENT ON TABLE support_ticket_messages IS 'Messages within support tickets';
COMMENT ON TABLE support_ticket_attachments IS 'File attachments for support tickets';
COMMENT ON TABLE chatbot_faq IS 'FAQ for chatbot responses';
COMMENT ON TABLE chatbot_conversations IS 'Chatbot conversation history';
