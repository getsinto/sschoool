# AI Chatbot Implementation Plan

## Overview
Comprehensive AI-powered chatbot system using Google Gemini API with support ticket integration.

## ✅ Phase 1: Core Chatbot (COMPLETED)

### Files Created:
1. **lib/chatbot/gemini.ts** - Gemini AI integration
   - API client initialization
   - Context-aware message handling
   - Intent detection
   - Escalation logic
   - Response parsing

2. **components/chatbot/ChatWidget.tsx** - Floating chat button
   - Fixed position (bottom-right)
   - Unread message badge
   - Open/close/minimize states
   - LocalStorage persistence

3. **components/chatbot/ChatInterface.tsx** - Main chat UI
   - Header with bot info and controls
   - Message area with auto-scroll
   - Input field with character limit
   - Quick replies integration
   - Typing indicator
   - Escalation button

4. **components/chatbot/MessageList.tsx** - Message display
   - User/bot message bubbles
   - Avatars and timestamps
   - Responsive layout

5. **components/chatbot/TypingIndicator.tsx** - Animated dots
   - Bounce animation
   - Bot avatar

6. **components/chatbot/QuickReplies.tsx** - Suggestion chips
   - Quick action buttons
   - Dynamic suggestions

7. **app/api/chatbot/message/route.ts** - Message API
   - Gemini integration
   - Context handling
   - Response formatting

## 📋 Phase 2: Support Ticket System (TODO)

### Database Schema:
```sql
-- Support tickets table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP
);

-- Ticket messages table
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id),
  user_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ticket attachments table
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id),
  message_id UUID REFERENCES ticket_messages(id),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Components to Create:

#### User Support Pages:
1. **app/(dashboard)/support/page.tsx**
   - My tickets list
   - Create ticket button
   - Filter by status
   - Search tickets

2. **app/(dashboard)/support/create/page.tsx**
   - Category selection
   - Priority selection
   - Subject and description
   - File attachments
   - Related course selection

3. **app/(dashboard)/support/[id]/page.tsx**
   - Ticket details
   - Conversation thread
   - Reply input
   - Status updates
   - File attachments

#### Admin Support Pages:
4. **app/(dashboard)/admin/support/page.tsx**
   - All tickets queue
   - Assigned to me
   - Filters and search
   - Metrics dashboard

5. **app/(dashboard)/admin/support/[id]/page.tsx**
   - Full ticket view
   - User information
   - Reply to ticket
   - Internal notes
   - Change status/priority
   - Assign to agent

#### Support Components:
6. **components/support/TicketList.tsx**
   - Ticket cards
   - Status badges
   - Priority indicators
   - Last update time

7. **components/support/TicketForm.tsx**
   - Form fields
   - Validation
   - File upload
   - Submit handling

8. **components/support/TicketThread.tsx**
   - Message list
   - User/agent messages
   - Timestamps
   - Attachments

9. **components/support/TicketFilters.tsx**
   - Status filter
   - Priority filter
   - Category filter
   - Date range

10. **components/support/TicketMetrics.tsx**
    - Open tickets count
    - Response time
    - Resolution time
    - Satisfaction score

### API Routes to Create:

1. **app/api/support/tickets/route.ts**
   - GET: List tickets
   - POST: Create ticket

2. **app/api/support/tickets/[id]/route.ts**
   - GET: Get ticket details
   - PATCH: Update ticket

3. **app/api/support/tickets/[id]/reply/route.ts**
   - POST: Add reply to ticket

4. **app/api/support/tickets/[id]/close/route.ts**
   - POST: Close ticket

5. **app/api/support/tickets/[id]/assign/route.ts**
   - POST: Assign ticket to agent

6. **app/api/chatbot/escalate/route.ts**
   - POST: Create ticket from chat

## 📋 Phase 3: FAQ Management (TODO)

### Database Schema:
```sql
-- FAQs table
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[],
  variations TEXT[],
  related_faqs UUID[],
  usage_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FAQ categories
CREATE TABLE faq_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);
```

### Components to Create:

1. **app/(dashboard)/admin/communication/chatbot/page.tsx**
   - FAQ list
   - Add/Edit/Delete FAQs
   - Categories management
   - Usage statistics

2. **app/(dashboard)/admin/communication/chatbot/analytics/page.tsx**
   - Conversation metrics
   - Popular topics
   - Bot effectiveness
   - Failed queries

3. **components/chatbot/FAQSearch.tsx**
   - Search interface
   - Category filter
   - Results display

### API Routes:

1. **app/api/chatbot/faq/search/route.ts**
   - Search FAQs by query

2. **app/api/admin/chatbot/faq/route.ts**
   - GET: List FAQs
   - POST: Create FAQ
   - PATCH: Update FAQ
   - DELETE: Delete FAQ

3. **app/api/admin/chatbot/analytics/route.ts**
   - GET: Bot analytics

## 📋 Phase 4: Advanced Features (TODO)

### Features to Implement:

1. **Context Awareness**
   - Detect user role from session
   - Track current page
   - Access user's courses
   - Remember conversation history

2. **Smart Actions**
   - Search courses
   - Fetch user schedule
   - Get progress/grades
   - Create support ticket
   - Show relevant FAQs

3. **Multi-language Support**
   - Language detection
   - Translation integration
   - Language selector

4. **Live Chat Transfer**
   - Real-time agent chat
   - Typing indicators
   - File sharing
   - Chat history

5. **Analytics & Reporting**
   - Conversation tracking
   - Resolution rates
   - User satisfaction
   - Common questions
   - Bot performance

## 🚀 Implementation Steps

### Week 1: Core Chatbot ✅
- [x] Gemini integration
- [x] Chat widget UI
- [x] Message handling
- [x] Quick replies
- [x] Basic API routes

### Week 2: Support Tickets
- [ ] Database migration
- [ ] Ticket creation
- [ ] Ticket listing
- [ ] Ticket details
- [ ] Reply functionality
- [ ] Admin dashboard

### Week 3: FAQ System
- [ ] FAQ database
- [ ] FAQ management UI
- [ ] FAQ search
- [ ] Integration with chatbot
- [ ] Analytics dashboard

### Week 4: Advanced Features
- [ ] Context awareness
- [ ] Smart actions
- [ ] Escalation flow
- [ ] Analytics
- [ ] Testing & optimization

## 📝 Integration Instructions

### 1. Add ChatWidget to Layout

```typescript
// app/layout.tsx or app/(dashboard)/layout.tsx
import ChatWidget from '@/components/chatbot/ChatWidget'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  )
}
```

### 2. Environment Variables

```env
# Add to .env.local
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies

```bash
npm install @google/generative-ai date-fns
```

### 4. Run Database Migrations

```bash
# Create support ticket tables
supabase db push
```

## 🎯 Usage Examples

### Guest User Flow:
```
Bot: "Welcome! I'm the St Haroon Assistant. How can I help you today?"
Quick replies: [Browse Courses] [Enrollment Process] [Pricing] [Contact Us]

User: "How do I enroll?"
Bot: "I'll guide you through enrollment! First, you'll need to create an account..."
[Step-by-step guide with links]
```

### Student User Flow:
```
Bot: "Hi [Name]! How can I help you today?"
Quick replies: [My Courses] [Upcoming Classes] [Grades] [Technical Issue]

User: "What's my next class?"
Bot: [Fetches from database]
"Your next class is Mathematics at 3:00 PM today. Would you like me to send you a reminder?"
[Yes] [No] [Add to Calendar]
```

### Parent User Flow:
```
Bot: "Hello! How can I assist you with your child's education today?"
Quick replies: [Child's Progress] [Attendance] [Talk to Teacher] [Payments]

User: "How is my child performing?"
Bot: [Fetches data]
"Here's a quick summary for [Child Name]:
- Overall Grade: B+ (87%)
- Attendance: 95%
- Active Courses: 5
Would you like a detailed report?"
```

## 🔒 Security Considerations

1. **Authentication**
   - Verify user identity before showing personal data
   - Use session tokens for API calls
   - Rate limit chat requests

2. **Data Privacy**
   - Don't expose sensitive information in chat
   - Log conversations securely
   - Allow users to delete chat history
   - Comply with GDPR/privacy regulations

3. **Input Validation**
   - Sanitize user input
   - Prevent injection attacks
   - Limit message length
   - Filter inappropriate content

## 📊 Success Metrics

- **Response Time**: < 2 seconds
- **Resolution Rate**: > 70% without escalation
- **User Satisfaction**: > 4/5 stars
- **Escalation Rate**: < 30%
- **Uptime**: > 99%

## 🐛 Known Limitations

1. Gemini API rate limits
2. Context window size limits
3. No real-time agent chat yet
4. Limited to text (no voice)
5. English language only (initially)

## 🔄 Future Enhancements

1. Voice input/output
2. Video chat with agents
3. Screen sharing
4. Chatbot training interface
5. A/B testing for responses
6. Sentiment analysis
7. Proactive chat triggers
8. Integration with CRM
9. Mobile app support
10. Offline mode

## 📚 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

**Status**: Phase 1 Complete (Core Chatbot)
**Next**: Phase 2 (Support Ticket System)
**Timeline**: 4 weeks for full implementation
