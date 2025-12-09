# Troubleshooting Guide

## Overview

This guide provides solutions to common issues encountered in the online education platform, organized by feature area.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Google Meet OAuth](#google-meet-oauth)
3. [File Upload Problems](#file-upload-problems)
4. [Database Errors](#database-errors)
5. [Session Timeout](#session-timeout)
6. [Payment Issues](#payment-issues)
7. [Performance Problems](#performance-problems)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Deployment Issues](#deployment-issues)
10. [Email Notifications](#email-notifications)

---

## Authentication Issues

### Problem: Users Cannot Log In

**Symptoms:**
- Login form submits but returns error
- "Invalid credentials" message appears
- Redirect loop after login

**Solutions:**

1. **Check Supabase Auth Status**:
```bash
# Verify auth is enabled
curl https://your-project.supabase.co/auth/v1/health
```

2. **Verify Environment Variables**:
```bash
# Check if variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

3. **Check User Status in Database**:
```sql
SELECT id, email, email_confirmed_at, banned_until
FROM auth.users
WHERE email = 'user@example.com';
```

4. **Clear Browser Cache**:
- Clear cookies and local storage
- Try in incognito mode

### Problem: Session Expires Immediately

**Symptoms:**
- User logged out right after login
- Session cookie not persisting

**Solutions:**

1. **Check Cookie Settings**:
```typescript
// Verify cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60, // 30 days
};
```

2. **Verify JWT Secret**:
```bash
# Ensure JWT secret matches between environments
echo $SUPABASE_JWT_SECRET
```

3. **Check Browser Settings**:
- Ensure cookies are enabled
- Check for third-party cookie blocking

---

## Google Meet OAuth

### Problem: OAuth Redirect Fails

**Symptoms:**
- "redirect_uri_mismatch" error
- Stuck on Google authorization page
- Returns to app but not connected

**Solutions:**

1. **Verify Redirect URI**:
```bash
# Check environment variable
echo $GOOGLE_REDIRECT_URI

# Should match exactly in Google Cloud Console
# Example: https://yourdomain.com/api/google-meet/callback
```

2. **Check Google Cloud Console**:
- Go to APIs & Services → Credentials
- Click on your OAuth 2.0 Client ID
- Verify redirect URIs include your exact URL
- Ensure no trailing slashes

3. **Test OAuth Flow**:
```bash
# Check if callback endpoint is accessible
curl https://yourdomain.com/api/google-meet/callback
```

### Problem: Token Refresh Fails

**Symptoms:**
- "invalid_grant" error
- User prompted to reconnect frequently
- Meetings fail to create

**Solutions:**

1. **Check Token Expiry**:
```sql
SELECT user_id, provider, expires_at, created_at
FROM integration_tokens
WHERE provider = 'google_meet'
AND user_id = 'user-id';
```

2. **Verify Refresh Token**:
```typescript
// Check if refresh token exists
const token = await getIntegrationToken(userId, 'google_meet');
if (!token.refresh_token) {
  // User needs to re-authorize
  return { needsReauth: true };
}
```

3. **Force Re-authorization**:
```typescript
// Disconnect and reconnect
await revokeGoogleAccess(userId);
// User must go through OAuth flow again
```

### Problem: Meeting Creation Fails

**Symptoms:**
- Error when creating Google Meet
- "Insufficient permissions" error
- Meeting created but no link returned

**Solutions:**

1. **Verify Scopes**:
```typescript
// Ensure these scopes are requested
const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];
```

2. **Check API Enablement**:
- Go to Google Cloud Console
- APIs & Services → Library
- Verify Google Calendar API is enabled

3. **Test API Access**:
```bash
# Test with access token
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://www.googleapis.com/calendar/v3/calendars/primary/events
```

---

## File Upload Problems

### Problem: Upload Fails with "File Too Large"

**Symptoms:**
- Upload stops at certain percentage
- "File size exceeds limit" error
- Request timeout

**Solutions:**

1. **Check Size Limits**:
```typescript
// Verify configuration
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,      // 10 MB
  video: 500 * 1024 * 1024,     // 500 MB
  document: 50 * 1024 * 1024,   // 50 MB
};
```

2. **Increase Vercel Limits**:
```json
// vercel.json
{
  "functions": {
    "api/upload/**": {
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

3. **Use Resumable Uploads**:
```typescript
// For files > 100MB, use tus protocol
import * as tus from 'tus-js-client';
```

### Problem: Images Not Optimizing

**Symptoms:**
- Original image uploaded without variants
- Thumbnails not generated
- Processing hangs

**Solutions:**

1. **Check Sharp Installation**:
```bash
npm list sharp
# If missing or wrong version:
npm install sharp@latest
```

2. **Verify Processing Function**:
```typescript
// Test image processing
import sharp from 'sharp';

const result = await sharp(buffer)
  .resize(150, 150)
  .toBuffer();
```

3. **Check Memory Limits**:
```bash
# Increase Node memory if needed
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

### Problem: Storage Permission Denied

**Symptoms:**
- "Permission denied" error
- Files upload but can't be accessed
- 403 errors when viewing files

**Solutions:**

1. **Check RLS Policies**:
```sql
-- Verify policies exist
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

2. **Test Policy**:
```sql
-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'user-id';

SELECT * FROM storage.objects
WHERE bucket_id = 'course-materials';
```

3. **Update Policies**:
```sql
-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read course materials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-materials');
```

---

## Database Errors

### Problem: Connection Pool Exhausted

**Symptoms:**
- "Too many connections" error
- Slow query responses
- Timeouts on database operations

**Solutions:**

1. **Check Active Connections**:
```sql
SELECT count(*) FROM pg_stat_activity;
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

2. **Configure Connection Pooling**:
```typescript
// Use Supabase connection pooler
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
    },
  }
);
```

3. **Close Unused Connections**:
```typescript
// Always close connections after use
try {
  const result = await query();
  return result;
} finally {
  await client.end();
}
```

### Problem: Slow Queries

**Symptoms:**
- API endpoints timeout
- Database CPU usage high
- Queries take > 1 second

**Solutions:**

1. **Identify Slow Queries**:
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

2. **Add Missing Indexes**:
```sql
-- Find missing indexes
SELECT schemaname, tablename, attname
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
AND correlation < 0.1;

-- Add index
CREATE INDEX CONCURRENTLY idx_courses_teacher
ON courses(teacher_id);
```

3. **Optimize Query**:
```sql
-- Before
SELECT * FROM courses WHERE teacher_id = 'xxx';

-- After (only select needed columns)
SELECT id, title, description FROM courses
WHERE teacher_id = 'xxx'
LIMIT 50;
```

### Problem: RLS Policy Blocking Legitimate Access

**Symptoms:**
- User can't access their own data
- "Row level security policy violation" error
- Empty results when data exists

**Solutions:**

1. **Check User Context**:
```sql
-- Verify user ID is set correctly
SELECT auth.uid();
SELECT auth.role();
```

2. **Test Policy Logic**:
```sql
-- Manually test policy condition
SELECT * FROM courses
WHERE teacher_id = auth.uid();
```

3. **Review Policy Definition**:
```sql
-- Check policy
SELECT * FROM pg_policies
WHERE tablename = 'courses';

-- Update if needed
DROP POLICY IF EXISTS "policy_name" ON courses;
CREATE POLICY "policy_name" ON courses
FOR SELECT TO authenticated
USING (teacher_id = auth.uid());
```

---

## Session Timeout

### Problem: Session Expires Too Quickly

**Symptoms:**
- Users logged out after 5-10 minutes
- Timeout warning appears too soon
- Session doesn't refresh on activity

**Solutions:**

1. **Check Timeout Configuration**:
```typescript
// Verify timeout settings
const INACTIVITY_TIMEOUT = 25 * 60 * 1000; // 25 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000;    // 30 minutes
```

2. **Verify Activity Tracking**:
```typescript
// Ensure activity listeners are attached
useEffect(() => {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
  });
  
  return () => {
    events.forEach(event => {
      window.removeEventListener(event, resetInactivityTimer);
    });
  };
}, []);
```

3. **Check Token Refresh**:
```typescript
// Verify refresh endpoint works
const response = await fetch('/api/session/refresh', {
  method: 'POST',
});
```

### Problem: Cross-Tab Sync Not Working

**Symptoms:**
- Logout in one tab doesn't affect others
- Session state inconsistent across tabs
- Multiple timeout warnings

**Solutions:**

1. **Check LocalStorage Events**:
```typescript
// Verify event listener
window.addEventListener('storage', (e) => {
  if (e.key === 'session_state') {
    syncSessionState(e.newValue);
  }
});
```

2. **Test Broadcast Channel**:
```typescript
// Alternative to localStorage
const channel = new BroadcastChannel('session_sync');
channel.postMessage({ type: 'logout' });
```

3. **Clear All Storage**:
```typescript
// On logout, clear everything
localStorage.clear();
sessionStorage.clear();
```

---

## Payment Issues

### Problem: Stripe Webhook Not Receiving Events

**Symptoms:**
- Payments succeed but not recorded
- Webhook endpoint returns 404
- Stripe dashboard shows failed deliveries

**Solutions:**

1. **Verify Webhook URL**:
```bash
# Check if endpoint is accessible
curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{}'
```

2. **Check Webhook Secret**:
```typescript
// Verify secret matches Stripe dashboard
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

3. **Test Webhook Locally**:
```bash
# Use Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

### Problem: Payment Fails Silently

**Symptoms:**
- User thinks payment succeeded
- No error message shown
- Payment not recorded

**Solutions:**

1. **Add Error Handling**:
```typescript
try {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
  });
} catch (error) {
  // Log to Sentry
  Sentry.captureException(error);
  
  // Show user-friendly message
  return { error: 'Payment failed. Please try again.' };
}
```

2. **Check Payment Status**:
```typescript
// Always verify payment status
const paymentIntent = await stripe.paymentIntents.retrieve(id);
if (paymentIntent.status !== 'succeeded') {
  throw new Error('Payment not completed');
}
```

---

## Performance Problems

### Problem: Slow Page Load Times

**Symptoms:**
- Pages take > 3 seconds to load
- High Time to First Byte (TTFB)
- Poor Lighthouse scores

**Solutions:**

1. **Enable Caching**:
```typescript
// Add cache headers
export const revalidate = 3600; // 1 hour

// Or use ISR
export async function generateStaticParams() {
  return [{ slug: 'example' }];
}
```

2. **Optimize Images**:
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Description"
  loading="lazy"
/>
```

3. **Code Splitting**:
```typescript
// Lazy load heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### Problem: High Memory Usage

**Symptoms:**
- Server crashes with OOM errors
- Vercel function timeouts
- Slow response times

**Solutions:**

1. **Increase Memory Limit**:
```json
// vercel.json
{
  "functions": {
    "api/**": {
      "memory": 3008
    }
  }
}
```

2. **Fix Memory Leaks**:
```typescript
// Always cleanup
useEffect(() => {
  const subscription = observable.subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

3. **Optimize Queries**:
```typescript
// Don't load all data at once
const { data } = await supabase
  .from('courses')
  .select('id, title')  // Only needed columns
  .range(0, 49);        // Pagination
```

---

## Monitoring and Logging

### Problem: Errors Not Appearing in Sentry

**Symptoms:**
- Known errors not in Sentry
- No error reports
- Missing stack traces

**Solutions:**

1. **Verify Sentry Initialization**:
```typescript
// Check if Sentry is initialized
import * as Sentry from '@sentry/nextjs';

if (!Sentry.getCurrentHub().getClient()) {
  console.error('Sentry not initialized!');
}
```

2. **Check DSN**:
```bash
# Verify DSN is set
echo $NEXT_PUBLIC_SENTRY_DSN
```

3. **Test Error Capture**:
```typescript
// Manually trigger test error
Sentry.captureException(new Error('Test error'));
```

### Problem: Missing Context in Error Reports

**Symptoms:**
- Can't reproduce errors
- No user information
- Missing breadcrumbs

**Solutions:**

1. **Set User Context**:
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});
```

2. **Add Breadcrumbs**:
```typescript
Sentry.addBreadcrumb({
  category: 'payment',
  message: 'Payment initiated',
  level: 'info',
  data: {
    amount: 99.99,
    currency: 'USD',
  },
});
```

3. **Add Tags**:
```typescript
Sentry.setTag('feature', 'google-meet');
Sentry.setTag('user_role', 'teacher');
```

---

## Deployment Issues

### Problem: Build Fails on Vercel

**Symptoms:**
- Deployment fails
- TypeScript errors in build
- Missing dependencies

**Solutions:**

1. **Check Build Logs**:
- Go to Vercel dashboard
- Click on failed deployment
- Review build logs

2. **Test Build Locally**:
```bash
npm run build
# Fix any errors that appear
```

3. **Verify Dependencies**:
```bash
# Ensure all dependencies are in package.json
npm install
npm run type-check
```

### Problem: Environment Variables Not Working

**Symptoms:**
- Features work locally but not in production
- "undefined" errors
- OAuth redirects fail

**Solutions:**

1. **Check Variable Names**:
```bash
# Client-side variables must start with NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=...  # ✓ Correct
SUPABASE_URL=...              # ✗ Won't work client-side
```

2. **Verify in Vercel**:
- Go to Project Settings → Environment Variables
- Ensure all variables are set for Production

3. **Redeploy**:
```bash
# After adding variables, redeploy
vercel --prod --force
```

---

## Email Notifications

### Problem: Emails Not Sending

**Symptoms:**
- Users not receiving emails
- No error messages
- Email queue growing

**Solutions:**

1. **Check Resend Status**:
```bash
# Test API key
curl https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@yourdomain.com",
    "to": "user@example.com",
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

2. **Verify Domain**:
- Go to Resend dashboard
- Check domain verification status
- Add required DNS records

3. **Check Email Queue**:
```sql
SELECT * FROM email_queue
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 10;
```

### Problem: Emails Going to Spam

**Symptoms:**
- Users report not receiving emails
- Emails in spam folder
- Low delivery rate

**Solutions:**

1. **Configure SPF/DKIM**:
```
# Add to DNS
TXT @ "v=spf1 include:_spf.resend.com ~all"
```

2. **Use Verified Domain**:
```typescript
// Use your domain, not resend.dev
from: 'noreply@yourdomain.com'
```

3. **Improve Content**:
- Avoid spam trigger words
- Include unsubscribe link
- Use proper HTML structure

---

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Search Sentry for similar errors
3. Review recent deployments
4. Check system status pages:
   - [Vercel Status](https://www.vercel-status.com/)
   - [Supabase Status](https://status.supabase.com/)
   - [Stripe Status](https://status.stripe.com/)

### How to Report Issues

Include:
1. **Error message**: Exact error text
2. **Steps to reproduce**: What you did before error
3. **Environment**: Production, staging, or development
4. **User info**: Role, ID (if applicable)
5. **Timestamp**: When did it occur
6. **Screenshots**: If UI-related
7. **Logs**: Relevant Sentry or Vercel logs

### Support Channels

- **Critical Issues**: Slack #alerts channel
- **Bug Reports**: GitHub Issues
- **Questions**: Slack #dev-support
- **Documentation**: Internal wiki

---

## Preventive Measures

### Regular Maintenance

- [ ] Weekly: Review Sentry errors
- [ ] Weekly: Check database performance
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review and optimize queries
- [ ] Quarterly: Security audit
- [ ] Quarterly: Load testing

### Monitoring Checklist

- [ ] Uptime monitoring configured
- [ ] Error alerts set up
- [ ] Performance alerts active
- [ ] Database monitoring enabled
- [ ] Storage usage tracked
- [ ] Cost alerts configured

### Documentation

- [ ] Keep runbooks updated
- [ ] Document new issues and solutions
- [ ] Update architecture diagrams
- [ ] Maintain API documentation
- [ ] Record deployment procedures
