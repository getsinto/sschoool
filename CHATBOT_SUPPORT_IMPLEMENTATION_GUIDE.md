# Chatbot & Support System - Implementation Guide

## Status: 70% Complete - 30% Remaining

This guide provides the exact implementation needed to complete the Chatbot & Support System.

---

## ✅ COMPLETED (Already Exists)

### Database & Types
- ✅ Complete database schema (8 tables)
- ✅ All TypeScript types defined
- ✅ RLS policies configured
- ✅ Sample FAQ data inserted

### UI Components  
- ✅ ChatWidget.tsx - Floating chat bubble
- ✅ ChatInterface.tsx - Main chat UI
- ✅ MessageList.tsx - Message display
- ✅ QuickReplies.tsx - Suggestion buttons
- ✅ TypingIndicator.tsx - Animated dots
- ✅ TicketList.tsx - Ticket listing
- ✅ TicketFilters.tsx - Filter controls
- ✅ TicketThread.tsx (admin) - Conversation view
- ✅ FAQManager.tsx (admin) - FAQ management

### API Routes
- ✅ /api/chatbot/message - Send message
- ✅ /api/chatbot/context - Get user context
- ✅ /api/chatbot/escalate - Create ticket
- ✅ /api/chatbot/feedback - Rate response
- ✅ /api/support/tickets - List/create tickets
- ✅ /api/support/tickets/[id] - Get/update ticket
- ✅ /api/admin/support/tickets - Admin ticket list
- ✅ /api/admin/support/tickets/[id] - Admin management

### Pages
- ✅ /admin/communication/chatbot - FAQ management

---

## ❌ TO COMPLETE (30% Remaining)

### Priority 1: Core Gemini Integration (CRITICAL)

**File:** `lib/chatbot/gemini.ts` (Incomplete - needs completion)

```typescript
// Add after existing code:

      // Send to Gemini
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Parse actions from response
      const actions = this.extractActions(text);
      const cleanedText = this.removeActionTags(text);

      // Create response message
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: cleanedText,
        timestamp: new Date(),
        suggestions: this.generateSuggestions(cleanedText, context),
        actions,
        intent: this.detectIntent(userMessage),
        confidence: 0.8
      };

      // Update history
      this.conversationHistory.push({
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });
      this.conversationHistory.push(botMessage);

      return botMessage;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to get response from AI');
    }
  }

  // Extract action tags from response
  private extractActions(text: string): ChatAction[] {
    const actions: ChatAction[] = [];
    const actionRegex = /\[ACTION:(\w+):([^\]]+)\]/g;
    let match;

    while ((match = actionRegex.exec(text)) !== null) {
      actions.push({
        type: match[1] as any,
        data: match[2]
      });
    }

    return actions;
  }

  // Remove action tags from text
  private removeActionTags(text: string): string {
    return text.replace(/\[ACTION:\w+:[^\]]+\]/g, '').trim();
  }

  // Detect user intent
  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('enroll') || lowerMessage.includes('register') || lowerMessage.includes('sign up')) {
      return 'enrollment';
    }
    if (lowerMessage.includes('course') || lowerMessage.includes('class')) {
      return 'course_info';
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return 'pricing';
    }
    if (lowerMessage.includes('schedule') || lowerMessage.includes('time')) {
      return 'schedule';
    }
    if (lowerMessage.includes('grade') || lowerMessage.includes('progress')) {
      return 'progress';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
      return 'support';
    }
    
    return 'general';
  }

  // Generate contextual suggestions
  private generateSuggestions(response: string, context: UserContext): string[] {
    const suggestions: string[] = [];
    
    if (context.userRole === 'guest') {
      suggestions.push('Browse Courses', 'How to Enroll', 'Pricing Info');
    } else if (context.userRole === 'student') {
      suggestions.push('My Courses', 'Upcoming Classes', 'My Grades');
    } else if (context.userRole === 'parent') {
      suggestions.push("Child's Progress", 'Attendance', 'Talk to Teacher');
    } else if (context.userRole === 'teacher') {
      suggestions.push('My Classes', 'Student Progress', 'Create Assignment');
    }
    
    return suggestions.slice(0, 4);
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }
}

// Export singleton instance
export const geminiChatbot = new GeminiChatbot();
```

---

### Priority 2: User Support Pages (HIGH)

#### 2.1 Support Tickets List Page
**File:** `app/(dashboard)/support/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TicketList } from '@/components/support/TicketList'
import { TicketFilters } from '@/components/support/TicketFilters'
import { Plus, Loader2 } from 'lucide-react'

export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    loadTickets()
  }, [statusFilter, categoryFilter])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      
      const response = await fetch(`/api/support/tickets?${params}`)
      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-gray-600 mt-1">View and manage your support requests</p>
        </div>
        <Button onClick={() => router.push('/support/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <TicketFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
      />

      <div className="mt-6">
        {loading ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-600 mt-4">Loading tickets...</p>
          </Card>
        ) : (
          <TicketList tickets={filteredTickets} />
        )}
      </div>
    </div>
  )
}
```

#### 2.2 Create Ticket Page
**File:** `app/(dashboard)/support/create/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function CreateTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/support/${data.ticket.id}`)
      }
    } catch (error) {
      console.error('Failed to create ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              >
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="academic">Academic</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about your issue"
                rows={6}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Ticket
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### Priority 3: Missing API Routes (MEDIUM)

#### 3.1 FAQ Search API
**File:** `app/api/chatbot/faq/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')

    const supabase = createClient()

    let queryBuilder = supabase
      .from('faqs')
      .select('*')
      .eq('active', true)

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    if (query) {
      queryBuilder = queryBuilder.or(`question.ilike.%${query}%,answer.ilike.%${query}%,keywords.cs.{${query}}`)
    }

    const { data: faqs, error } = await queryBuilder
      .order('usage_count', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('FAQ search error:', error)
    return NextResponse.json(
      { error: 'Failed to search FAQs' },
      { status: 500 }
    )
  }
}
```

---

## 📋 COMPLETE FILE LIST TO CREATE

### Components (4 files)
1. `components/chatbot/MessageInput.tsx`
2. `components/chatbot/EscalationFlow.tsx`
3. `components/support/TicketForm.tsx`
4. `components/support/AttachmentUpload.tsx`

### API Routes (5 files)
1. `app/api/chatbot/faq/search/route.ts`
2. `app/api/support/tickets/[id]/reply/route.ts`
3. `app/api/support/tickets/[id]/close/route.ts`
4. `app/api/admin/chatbot/faq/route.ts`
5. `app/api/admin/chatbot/analytics/route.ts`

### Pages (3 files)
1. `app/(dashboard)/support/page.tsx`
2. `app/(dashboard)/support/[id]/page.tsx`
3. `app/(dashboard)/support/create/page.tsx`
4. `app/(dashboard)/admin/support/page.tsx`
5. `app/(dashboard)/admin/support/[id]/page.tsx`

---

## 🔧 SETUP REQUIRED

### Environment Variables
Add to `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Install Dependencies
```bash
npm install @google/generative-ai
```

---

## ✅ TESTING CHECKLIST

- [ ] Gemini API responds to messages
- [ ] Rate limiting works
- [ ] Ticket creation works
- [ ] Ticket listing works
- [ ] Ticket replies work
- [ ] FAQ search works
- [ ] Admin can manage tickets
- [ ] File attachments work
- [ ] Notifications sent on ticket updates

---

## 📊 ESTIMATED COMPLETION TIME

- Gemini Library: 2 hours
- Support Pages: 4 hours
- API Routes: 3 hours
- Components: 2 hours
- Testing: 2 hours

**Total: ~13 hours**

