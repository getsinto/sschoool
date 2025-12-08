# Notifications & Gemini API Fix Guide

## Issues Fixed

### 1. Supabase Notifications Permission Denied (42501)
**Error:** `permission denied for table notifications`

**Root Cause:** RLS policies exist but table permissions weren't granted to authenticated users.

### 2. Gemini API 404 Error
**Error:** `404 Not Found for models/gemini-pro`

**Root Cause:** `gemini-pro` model is deprecated. Need to use `gemini-1.5-flash` or `gemini-1.5-pro`.

## Fixes Applied

### Fix 1: Notifications Table Permissions

**File:** `FIX_NOTIFICATIONS_PERMISSIONS_NOW.sql`

**Steps to Apply:**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to SQL Editor

2. **Run the Fix SQL**
   ```sql
   -- Copy and paste the entire content of FIX_NOTIFICATIONS_PERMISSIONS_NOW.sql
   -- Then click "Run"
   ```

3. **What This Does:**
   - Drops and recreates RLS policies with proper permissions
   - Grants SELECT, INSERT, UPDATE, DELETE on notifications to authenticated users
   - Adds performance indexes for faster queries
   - Fixes notification_preferences and push_subscriptions tables

4. **Verify the Fix:**
   ```sql
   -- Run this query to test
   SELECT * FROM notifications WHERE user_id = auth.uid() LIMIT 5;
   
   -- Check unread count
   SELECT COUNT(*) FROM notifications WHERE user_id = auth.uid() AND read = false;
   ```

### Fix 2: Gemini API Model Update

**File:** `lib/chatbot/gemini.ts`

**Change Made:**
```typescript
// Before (deprecated)
this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// After (current)
this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

**Why:**
- `gemini-pro` is deprecated and returns 404
- `gemini-1.5-flash` is the current recommended model
- Alternative: `gemini-1.5-pro` for more advanced use cases

## Testing Instructions

### Test Notifications API Locally

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Test notifications endpoint (requires auth token)
curl http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test notifications stats
curl http://localhost:3000/api/notifications/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test on Vercel

1. **Deploy Changes:**
   ```bash
   git add -A
   git commit -m "fix: notifications RLS permissions and Gemini API model"
   git push origin main
   ```

2. **Apply SQL Fix on Supabase:**
   - Run `FIX_NOTIFICATIONS_PERMISSIONS_NOW.sql` in Supabase SQL Editor

3. **Test in Production:**
   - Log in to your app
   - Check if notifications load without errors
   - Check browser console for any 42501 errors
   - Test chatbot to ensure Gemini API works

### Test Gemini Chatbot

1. **Verify API Key:**
   ```bash
   # Check if GEMINI_API_KEY is set in Vercel
   # Go to Vercel Dashboard > Project > Settings > Environment Variables
   ```

2. **Test Chatbot:**
   - Navigate to chatbot interface
   - Send a test message
   - Should receive response without 404 error

## Environment Variables

Ensure these are set in Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

## Common Issues & Solutions

### Issue: Still Getting 42501 Error

**Solution:**
1. Verify SQL script ran successfully in Supabase
2. Check if RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'notifications';`
3. Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'notifications';`
4. Try using service role key for admin operations

### Issue: Gemini Still Returns 404

**Solutions:**
1. Verify GEMINI_API_KEY is set correctly
2. Check if API key has proper permissions in Google Cloud Console
3. Try alternative model: `gemini-1.5-pro`
4. Fallback chatbot will activate automatically if Gemini fails

### Issue: Notifications Work But Slow

**Solution:**
The fix includes performance indexes:
```sql
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
```

## Files Modified

1. ✅ `lib/chatbot/gemini.ts` - Updated model name
2. ✅ `FIX_NOTIFICATIONS_PERMISSIONS_NOW.sql` - SQL fix script
3. ✅ `supabase/migrations/20250112000001_fix_notifications_rls_and_gemini.sql` - Migration file

## Deployment Checklist

- [ ] Run SQL fix in Supabase SQL Editor
- [ ] Commit code changes
- [ ] Push to GitHub
- [ ] Wait for Vercel deployment
- [ ] Test notifications API
- [ ] Test chatbot
- [ ] Monitor Vercel logs for errors
- [ ] Check Supabase logs for permission errors

## Monitoring

### Vercel Logs
```bash
# Check for errors
vercel logs --follow
```

### Supabase Logs
- Go to Supabase Dashboard > Logs
- Filter by "Error"
- Look for 42501 errors

### Browser Console
- Open DevTools > Console
- Look for API errors
- Check Network tab for failed requests

## Rollback Plan

If issues persist:

1. **Disable RLS temporarily (NOT RECOMMENDED FOR PRODUCTION):**
   ```sql
   ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
   ```

2. **Use Service Role Key for admin operations:**
   - Update API routes that need admin access
   - Use `SUPABASE_SERVICE_ROLE_KEY` instead of anon key

3. **Revert Gemini model:**
   ```typescript
   // Use fallback chatbot only
   return fallbackChatbot.sendMessage(userMessage, context);
   ```

## Support

If issues persist after applying these fixes:

1. Check Supabase Dashboard > Database > Roles & Permissions
2. Verify authenticated role has proper grants
3. Check if there are any custom RLS policies conflicting
4. Review Supabase logs for detailed error messages

## Success Criteria

✅ Notifications API returns 200 status
✅ No 42501 permission denied errors
✅ Unread count displays correctly
✅ Chatbot responds without 404 errors
✅ No console errors in browser
✅ Vercel logs show no errors

