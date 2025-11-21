-- Support System Tables

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  satisfaction_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support ticket messages/replies
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_role VARCHAR(20) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support ticket attachments
CREATE TABLE IF NOT EXISTS support_ticket_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES support_ticket_messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support ticket internal notes (admin only)
CREATE TABLE IF NOT EXISTS support_ticket_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canned responses for support
CREATE TABLE IF NOT EXISTS support_canned_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ for chatbot
CREATE TABLE IF NOT EXISTS chatbot_faq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  keywords TEXT[], -- Array of keywords for search
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  escalated_to_ticket UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON support_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_attachments_ticket_id ON support_ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_notes_ticket_id ON support_ticket_notes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_faq_category ON chatbot_faq(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);

-- Create updated_at trigger for support_tickets
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- Create updated_at trigger for support_canned_responses
CREATE TRIGGER trigger_update_support_canned_responses_updated_at
  BEFORE UPDATE ON support_canned_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- Create updated_at trigger for chatbot_faq
CREATE TRIGGER trigger_update_chatbot_faq_updated_at
  BEFORE UPDATE ON chatbot_faq
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- Create updated_at trigger for chatbot_conversations
CREATE TRIGGER trigger_update_chatbot_conversations_updated_at
  BEFORE UPDATE ON chatbot_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- RLS Policies

-- Support tickets policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (created_by = auth.uid());

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Support ticket messages policies
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their tickets
CREATE POLICY "Users can view messages for own tickets" ON support_ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = ticket_id 
      AND support_tickets.created_by = auth.uid()
    )
  );

-- Users can create messages for their tickets
CREATE POLICY "Users can create messages for own tickets" ON support_ticket_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = ticket_id 
      AND support_tickets.created_by = auth.uid()
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON support_ticket_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Support ticket attachments policies
ALTER TABLE support_ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments for their tickets
CREATE POLICY "Users can view attachments for own tickets" ON support_ticket_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = ticket_id 
      AND support_tickets.created_by = auth.uid()
    )
  );

-- Users can upload attachments for their tickets
CREATE POLICY "Users can upload attachments for own tickets" ON support_ticket_attachments
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = ticket_id 
      AND support_tickets.created_by = auth.uid()
    )
  );

-- Admins can manage all attachments
CREATE POLICY "Admins can manage all attachments" ON support_ticket_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Support ticket notes policies (admin only)
ALTER TABLE support_ticket_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage notes" ON support_ticket_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Canned responses policies (admin only)
ALTER TABLE support_canned_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage canned responses" ON support_canned_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- FAQ policies
ALTER TABLE chatbot_faq ENABLE ROW LEVEL SECURITY;

-- Everyone can read active FAQs
CREATE POLICY "Everyone can read active FAQs" ON chatbot_faq
  FOR SELECT USING (is_active = true);

-- Admins can manage FAQs
CREATE POLICY "Admins can manage FAQs" ON chatbot_faq
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Chatbot conversations policies
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON chatbot_conversations
  FOR SELECT USING (user_id = auth.uid());

-- Users can create/update their own conversations
CREATE POLICY "Users can manage own conversations" ON chatbot_conversations
  FOR ALL USING (user_id = auth.uid());

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations" ON chatbot_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
