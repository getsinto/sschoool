# Chatbot & Support System - Deployment Guide

## 🚀 Complete Setup Instructions

This guide will walk you through deploying the complete Chatbot & Support Ticket System.

---

## 📋 Prerequisites

### Required Services
- ✅ Supabase account and project
- ✅ Google Cloud account (for Gemini AI)
- ✅ Resend account (for emails)
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager

### Required API Keys
You'll need to obtain the following API keys:
1. **Google Gemini API Key** - For AI chatbot
2. **Supabase URL & Anon Key** - For database
3. **Resend API Key** - For email notifications

---

## 🔧 Step 1: Environment Configuration

### 1.1 Create `.env.local` file

```bash
# Copy the example file
cp .env.example .env.local
```

### 1.2 Add Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Resend Email Service
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

---

## 🗄️ Step 2: Database Setup

### 2.1 Run Migrations

```bash
# Navigate to your project directory
cd your-project

# Run the chatbot and support system migration
npx supabase db push

# Or if using Supabase CLI
supabase db push
```

### 2.2 Create Storage Bucket

Run this SQL in your Supabase SQL Editor:

```sql
-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', false);

-- Set up RLS policies for support attachments
CREATE POLICY "Users can upload their own attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'support-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2.3 Verify Database Tables

Check that these tables exist:
- ✅ `support_tickets`
- ✅ `ticket_replies`
- ✅ `ticket_attachments`
- ✅ `chatbot_sessions`
- ✅ `chatbot_messages`
- ✅ `chatbot_feedback`

---

## 🤖 Step 3: Google Gemini AI Setup

### 3.1 Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key
4. Add to `.env.local` as `GOOGLE_GEMINI_API_KEY`

### 3.2 Configure AI Model

The system uses `gemini-pro` by default. You can change this in `lib/chatbot/gemini.ts`:

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro' // or 'gemini-pro-vision' for image support
});
```

### 3.3 Test AI Integration

```bash
# Run the development server
npm run dev

# Open http://localhost:3000
# Click the chat widget
# Send a test message
```

---

## 📧 Step 4: Email Notifications Setup

### 4.1 Configure Resend

1. Sign up at [Resend.com](https://resend.com)
2. Verify your domain
3. Get your API key
4. Add to `.env.local` as `RESEND_API_KEY`

### 4.2 Email Templates

Email templates are located in `/emails/` directory:
- `SupportTicketCreated.tsx`
- `SupportTicketReply.tsx`
- `SupportTicketResolved.tsx`
- `SupportTicketClosed.tsx`

### 4.3 Test Email Sending

```bash
# Test email endpoint
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

---

## 🔐 Step 5: Security Configuration

### 5.1 Row Level Security (RLS)

Verify RLS policies are enabled:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('support_tickets', 'ticket_replies', 'chatbot_sessions');
```

### 5.2 API Rate Limiting

Add rate limiting middleware (optional):

```typescript
// middleware.ts
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Rate limit chatbot API
  if (request.nextUrl.pathname.startsWith('/api/chatbot')) {
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return new Response('Too many requests', { status: 429 });
    }
  }
  
  return NextResponse.next();
}
```

### 5.3 Content Security Policy

Add CSP headers in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 📦 Step 6: Install Dependencies

### 6.1 Install Required Packages

```bash
# Install all dependencies
npm install

# Or with yarn
yarn install
```

### 6.2 Verify Package Installation

Check that these packages are installed:
- ✅ `@google/generative-ai` - Gemini AI SDK
- ✅ `@supabase/supabase-js` - Supabase client
- ✅ `resend` - Email service
- ✅ `react-email` - Email templates
- ✅ `uuid` - ID generation
- ✅ `lucide-react` - Icons

---

## 🧪 Step 7: Testing

### 7.1 Run Development Server

```bash
npm run dev
```

### 7.2 Test Chatbot

1. Open http://localhost:3000
2. Click chat widget (bottom-right)
3. Send test messages:
   - "How do I enroll in a course?"
   - "What payment methods do you accept?"
   - "I need help with my assignment"

### 7.3 Test Support Tickets

1. Navigate to `/support`
2. Click "New Ticket"
3. Fill in the form
4. Submit ticket
5. Check email for confirmation
6. Reply to ticket
7. Verify admin can see ticket at `/admin/communication/support-tickets`

### 7.4 Test File Uploads

1. Create a ticket
2. Attach a file (image, PDF, or document)
3. Submit ticket
4. Verify file appears in ticket details
5. Download file to verify

---

## 🚀 Step 8: Production Deployment

### 8.1 Build for Production

```bash
# Build the application
npm run build

# Test production build locally
npm run start
```

### 8.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - GOOGLE_GEMINI_API_KEY
# - RESEND_API_KEY
# - etc.
```

### 8.3 Deploy to Other Platforms

#### Netlify
```bash
# Build command
npm run build

# Publish directory
.next
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔍 Step 9: Monitoring & Analytics

### 9.1 Set Up Error Tracking

Add Sentry or similar:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### 9.2 Monitor API Performance

Track these metrics:
- Chatbot response times
- Ticket creation rate
- Email delivery rate
- Error rates
- User satisfaction scores

### 9.3 Set Up Alerts

Configure alerts for:
- High error rates
- Slow response times
- Failed email deliveries
- Storage quota warnings
- API rate limit hits

---

## 📊 Step 10: Admin Configuration

### 10.1 Create Admin User

```sql
-- Update a user to admin role
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@yourdomain.com';
```

### 10.2 Configure Chatbot Settings

Admin can configure:
- FAQ responses
- Auto-reply messages
- Escalation rules
- Business hours
- Agent assignments

### 10.3 Set Up Support Agents

```sql
-- Create support agent role
UPDATE users 
SET role = 'support_agent' 
WHERE email IN ('agent1@yourdomain.com', 'agent2@yourdomain.com');
```

---

## ✅ Step 11: Post-Deployment Checklist

### Functionality Tests
- [ ] Chatbot responds to messages
- [ ] Users can create tickets
- [ ] File uploads work
- [ ] Email notifications sent
- [ ] Admin can view all tickets
- [ ] Admin can reply to tickets
- [ ] Ticket status updates work
- [ ] Search and filters work
- [ ] Mobile responsive
- [ ] Accessibility features work

### Security Tests
- [ ] RLS policies enforced
- [ ] File upload restrictions work
- [ ] Rate limiting active
- [ ] HTTPS enabled
- [ ] API keys secured
- [ ] No sensitive data exposed

### Performance Tests
- [ ] Page load times < 3s
- [ ] Chatbot response < 2s
- [ ] File uploads < 10s
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Caching configured

---

## 🐛 Troubleshooting

### Common Issues

#### Chatbot Not Responding
```bash
# Check API key
echo $GOOGLE_GEMINI_API_KEY

# Check API logs
tail -f logs/api.log

# Test API directly
curl https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### File Upload Fails
```sql
-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'support-attachments';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Check storage quota
SELECT SUM(metadata->>'size')::bigint as total_size 
FROM storage.objects 
WHERE bucket_id = 'support-attachments';
```

#### Emails Not Sending
```bash
# Test Resend API
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

#### Database Connection Issues
```bash
# Test Supabase connection
curl https://YOUR_PROJECT.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 📚 Additional Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Resend Docs](https://resend.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### Support
- GitHub Issues: [Your Repo]
- Email: support@yourdomain.com
- Discord: [Your Server]

---

## 🎉 Success!

Your Chatbot & Support System is now deployed and ready to use!

### Next Steps
1. Train chatbot with your FAQs
2. Customize email templates
3. Set up monitoring dashboards
4. Train support team
5. Announce to users

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Status:** ✅ Production Ready
