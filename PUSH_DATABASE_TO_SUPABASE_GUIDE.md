# Push Database Migration to Supabase - Complete Guide

## 🚀 Quick Start (Recommended - 2 Minutes)

### Method 1: Direct SQL Execution in Supabase Dashboard

This is the **fastest and most reliable** method:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click **"SQL Editor"** in the left sidebar

2. **Copy the SQL Fix**
   - Open file: `FIX_NOTIFICATIONS_PERMISSIONS_NOW.sql`
   - Select all content (Ctrl+A)
   - Copy (Ctrl+C)

3. **Execute in Supabase**
   - Paste into SQL Editor (Ctrl+V)
   - Click **"Run"** button (or press Ctrl+Enter)
   - Wait for "Success. No rows returned" message

4. **Verify the Fix**
   ```sql
   -- Test query 1: Check if you can read notifications
   SELECT COUNT(*) FROM notifications;
   
   -- Test query 2: Check policies exist
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   
   -- Test query 3: Check RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('notifications', 'notification_preferences', 'push_subscriptions');
   ```

**Expected Results:**
- Query 1: Returns a count (no permission error)
- Query 2: Shows 4 policies
- Query 3: All tables show `rowsecurity = true`

---

## 🔧 Method 2: Using Supabase CLI

### Prerequisites

```powershell
# Check if Supabase CLI is installed
supabase --version

# If not installed, install it
npm install -g supabase

# Or using scoop (Windows)
scoop install supabase
```

### Step 1: Link Your Project

```powershell
# Get your project reference ID from:
# https://supabase.com/dashboard/project/_/settings/general

# Link the project
supabase link --project-ref YOUR_PROJECT_REF

# You'll be prompted for your database password
```

### Step 2: Check Migration Status

```powershell
# See which migrations have been applied
supabase db remote list

# See local migrations that haven't been pushed
supabase migration list
```

### Step 3: Push the Migration

```powershell
# Push all pending migrations
supabase db push

# Or push specific migration
supabase db push --include-all
```

### Step 4: Verify

```powershell
# Check remote migrations again
supabase db remote list

# Should show: 20250112000001_fix_notifications_rls_and_gemini.sql
```

---

## 📋 What Gets Applied

The migration will:

✅ **Drop and recreate RLS policies** with proper permissions
✅ **Grant SELECT, INSERT, UPDATE, DELETE** on notifications to authenticated users
✅ **Add performance indexes** for faster queries
✅ **Fix notification_preferences** table permissions
✅ **Fix push_subscriptions** table permissions
✅ **Enable RLS** on all notification tables
✅ **Grant sequence permissions** for auto-increment IDs

---

## ✅ Post-Deployment Verification

### 1. Test in Supabase Dashboard

Run these queries in SQL Editor:

```sql
-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'notifications';

-- Check table permissions
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'notifications'
AND grantee = 'authenticated';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'notifications';
```

### 2. Test in Your Application

```powershell
# Start your dev server
npm run dev

# Open browser to: http://localhost:3000
# Log in as a user
# Check notifications bell icon
# Open browser console (F12)
# Look for any 42501 errors (should be none)
```

### 3. Test API Endpoints

```powershell
# Test notifications API
curl http://localhost:3000/api/notifications

# Test notifications stats
curl http://localhost:3000/api/notifications/stats

# Should return data without permission errors
```

---

## 🚨 Troubleshooting

### Error: "permission denied for table notifications"

**Cause:** The migration hasn't been applied yet.

**Solution:** Run the SQL fix in Supabase SQL Editor (Method 1).

### Error: "relation 'notifications' does not exist"

**Cause:** Base tables haven't been created.

**Solution:** 
```powershell
# Push all migrations in order
supabase db push --include-all
```

### Error: "policy already exists"

**Cause:** Policies exist but with wrong permissions.

**Solution:** The migration includes `DROP POLICY IF EXISTS` statements, so this should auto-resolve. If not, manually drop policies:

```sql
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
```

Then re-run the migration.

### Error: "Supabase CLI not linked"

**Solution:**
```powershell
# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Find project ref at:
# https://supabase.com/dashboard/project/_/settings/general
```

### Error: "Database password required"

**Solution:**
```powershell
# Get database password from:
# https://supabase.com/dashboard/project/_/settings/database

# Or reset it if forgotten
```

---

## 📊 Expected Results After Migration

### ✅ Notifications API
- `GET /api/notifications` → Returns user's notifications
- `GET /api/notifications/stats` → Returns unread count
- `POST /api/notifications/send` → Creates notifications
- No 42501 permission denied errors

### ✅ Chatbot
- Responds without 404 errors
- Uses gemini-1.5-flash model
- Fallback chatbot activates if Gemini fails

### ✅ Performance
- Faster notification queries (indexes added)
- Efficient user_id lookups
- Optimized read/unread filtering

### ✅ Security
- RLS enabled on all tables
- Users can only access their own data
- Proper authentication checks

---

## 🎯 Quick Command Reference

```powershell
# Method 1: Manual (Fastest - Recommended)
# 1. Open https://supabase.com/dashboard
# 2. Click SQL Editor
# 3. Copy FIX_NOTIFICATIONS_PERMISSIONS_NOW.sql
# 4. Paste and click Run

# Method 2: CLI
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# Verify
supabase db remote list

# Check logs
supabase db remote logs
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check Supabase Dashboard → Logs**
   - Look for SQL errors
   - Check RLS policy violations

2. **Check Vercel Logs**
   ```powershell
   vercel logs --follow
   ```

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for API errors
   - Check network tab for 42501 errors

4. **Review Documentation**
   - `NOTIFICATIONS_GEMINI_FIX_GUIDE.md` - Detailed troubleshooting
   - `PUSH_TO_SUPABASE_NOW.md` - Alternative guide

---

## ✅ Success Checklist

- [ ] SQL fix applied in Supabase (Method 1 or 2)
- [ ] No errors in Supabase SQL Editor
- [ ] Policies exist (verified with query)
- [ ] RLS enabled (verified with query)
- [ ] Indexes created (verified with query)
- [ ] Test query works without permission errors
- [ ] App loads notifications without errors
- [ ] No 42501 errors in browser console
- [ ] Chatbot responds without 404 errors
- [ ] API endpoints return data successfully

---

## 🎉 Next Steps After Successful Push

1. **Test all notification features**
   - Bell icon shows unread count
   - Clicking bell shows notifications list
   - Marking as read works
   - Deleting notifications works

2. **Test chatbot**
   - Opens without errors
   - Responds to messages
   - Can escalate to support tickets

3. **Monitor for errors**
   ```powershell
   # Watch Vercel logs
   vercel logs --follow
   
   # Check Supabase logs
   # Dashboard → Logs → Database
   ```

4. **Deploy to production**
   ```powershell
   git add -A
   git commit -m "fix: apply notifications RLS and permissions fix"
   git push origin main
   ```

---

**RECOMMENDED:** Use Method 1 (Direct SQL) - it's the fastest and most reliable!

**Time Required:** 2-5 minutes

**Difficulty:** Easy ⭐

