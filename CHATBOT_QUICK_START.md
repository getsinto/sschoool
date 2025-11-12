# AI Chatbot - Quick Start Guide

## ✅ What's Been Created

### Core Chatbot System (Ready to Use!)

**1. Gemini AI Integration** (`lib/chatbot/gemini.ts`)
- Context-aware conversations
- Intent detection
- Escalation logic
- Response parsing with suggestions

**2. Chat Widget** (`components/chatbot/ChatWidget.tsx`)
- Floating chat button (bottom-right)
- Unread message badge
- Minimize/maximize functionality
- Persistent state

**3. Chat Interface** (`components/chatbot/ChatInterface.tsx`)
- Full chat UI with header
- Message history
- Input field with character limit
- Quick reply suggestions
- Typing indicator
- "Talk to human" escalation

**4. Supporting Components**
- `MessageList.tsx` - Message display with avatars
- `TypingIndicator.tsx` - Animated typing dots
- `QuickReplies.tsx` - Suggestion chips

**5. API Route** (`app/api/chatbot/message/route.ts`)
- Message processing
- Gemini integration
- Context handling

**6. Database Schema** (`supabase/migrations/007_chatbot_support.sql`)
- Support tickets system
- FAQ management
- Chat conversations tracking
- Analytics tables

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install @google/generative-ai date-fns
```

### Step 2: Configure Environment
Add to `.env.local`:
```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### Step 3: Run Database Migration
```bash
supabase db push
```

### Step 4: Add Chat Widget to Your App

**Option A: Add to Main Layout (All Pages)**
```typescript
// app/layout.tsx
import ChatWidget from '@/components/chatbot/ChatWidget'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
```

**Option B: Add to Dashboard Only**
```typescript
// app/(dashboard)/layout.tsx
import ChatWidget from '@/components/chatbot/ChatWidget'

export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  )
}
```

**Option C: Add to Public Pages**
```typescript
// app/(public)/layout.tsx
import ChatWidget from '@/components/chatbot/ChatWidget'

export default function PublicLayout({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  )
}
```

### Step 5: Test the Chatbot
1. Start your dev server: `npm run dev`
2. Look for the blue chat button in the bottom-right corner
3. Click to open the chat
4. Try asking questions like:
   - "How do I enroll?"
   - "What courses do you offer?"
   - "I need help with payment"
   - "Talk to a human"

## 💬 Current Features

### ✅ Working Now:
- Floating chat widget
- AI-powered responses using Gemini
- Context-aware conversations
- Quick reply suggestions
- Typing indicators
- Message history (localStorage)
- Character limit (500 chars)
- Escalation to human support
- Intent detection
- Mobile responsive

### 🎯 Smart Responses For:
- Course inquiries
- Enrollment questions
- Schedule information
- Payment questions
- Technical support
- General help

### 🤖 AI Capabilities:
- Natural language understanding
- Context from user role
- Personalized responses
- Suggested actions
- Confidence scoring
- Automatic escalation detection

## 📝 Customization

### Change Bot Name
```typescript
// components/chatbot/ChatInterface.tsx
<h3 className="font-semibold">Your Bot Name</h3>
```

### Change Bot Avatar
```typescript
// components/chatbot/MessageList.tsx
// Replace <Bot /> icon with your custom avatar
```

### Modify System Prompt
```typescript
// lib/chatbot/gemini.ts
private buildSystemPrompt(context: UserContext): string {
  return `Your custom system prompt here...`
}
```

### Add Custom Quick Replies
```typescript
// lib/chatbot/gemini.ts
// Modify parseResponse() method to add custom suggestions
```

### Change Colors
```typescript
// components/chatbot/ChatWidget.tsx
className="bg-blue-600 hover:bg-blue-700" // Change to your brand colors
```

## 🔧 Advanced Configuration

### Add User Context
```typescript
// When calling the API, pass user context:
const response = await fetch('/api/chatbot/message', {
  method: 'POST',
  body: JSON.stringify({
    message: userMessage,
    userContext: {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      enrolledCourses: user.courses
    }
  })
})
```

### Implement Custom Actions
```typescript
// lib/chatbot/gemini.ts
// Add new action types in ChatAction interface
// Implement action handlers in your components
```

## 📊 What's Next?

### Phase 2: Support Ticket System
- Create ticket from chat
- View ticket history
- Admin ticket management
- Email notifications

### Phase 3: FAQ Management
- Admin FAQ editor
- FAQ search integration
- Usage analytics
- Auto-suggestions

### Phase 4: Advanced Features
- Real-time agent chat
- File attachments
- Voice input
- Multi-language support
- Advanced analytics

## 🐛 Troubleshooting

### Chat button not showing?
- Check that ChatWidget is imported in your layout
- Verify z-index isn't being overridden
- Check browser console for errors

### API errors?
- Verify GOOGLE_GEMINI_API_KEY is set
- Check API key is valid
- Review rate limits

### Messages not sending?
- Check network tab for API errors
- Verify API route is accessible
- Check Gemini API status

### Styling issues?
- Ensure Tailwind CSS is configured
- Check for CSS conflicts
- Verify all UI components are installed

## 📚 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Implementation Plan](./CHATBOT_IMPLEMENTATION_PLAN.md)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 You're Ready!

The chatbot is now live on your site! Users can:
1. Click the chat button
2. Ask questions
3. Get AI-powered responses
4. Escalate to human support when needed

The bot will learn from conversations and improve over time. Monitor the chat logs to identify common questions and add them to your FAQ system.

---

**Need Help?** Check the [Implementation Plan](./CHATBOT_IMPLEMENTATION_PLAN.md) for detailed information about all features and future enhancements.
