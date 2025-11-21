# API Fixes - Deployment Guide

## Issues Fixed

### 1. ✅ Missing `/api/user/role` endpoint (404 Error)
**File Created:** `app/api/user/role/route.ts`

This endpoint fetches the authenticated user's role from the profiles table.

### 2. ✅ Missing `/api/notifications/stats` endpoint (500 Error)
**File Created:** `app/api/notifications/stats/route.ts`

Returns notification statistics including:
- Unread count
- Total count
- Counts by notification type

### 3. ✅ Notifications Bell Not Working
**Files Modified:**
- `app/(dashboard)/layout.tsx` - Now uses `NotificationBell` component
- Uses existing `NotificationBell`, `NotificationDropdown`, and `useNotifications` hook

The bell icon now:
- Shows real-time unread count
- Opens a dropdown with recent notifications
- Allows marking notifications as read
- Links to full notifications page

### 4. ✅ Missing Images (404 Errors)
**Files Created:**
- `public/images/grid-pattern.svg` - Grid background pattern
- `public/avatars/placeholder.svg` - Default avatar placeholder

### 5. ✅ Support Tickets API 500 Error
**File Created:** `supabase/migrations/021_support_system.sql`

Complete support system database schema including:
- `support_tickets` table
- `support_ticket_messages` table
- `support_ticket_attachments` table
- `support_ticket_notes` table (admin only)
- `support_canned_responses` table
- `chatbot_faq` table
- `chatbot_conversations` table
- All necessary RLS policies and indexes

## Deployment Steps

### Step 1: Commit and Push Changes

```bash
git add .
git commit -m "Fix: Add user role API, fix notifications bell, add support system migration"
git push origin main
```

### Step 2: Vercel will automatically deploy the changes

Wait for the deployment to complete on Vercel. You can monitor it at:
https://vercel.com/your-project/deployments

### Step 3: Run Database Migration

You need to apply the support system migration to your Supabase database.

**Option A: Using Supabase CLI (Recommended)**

```bash
# Make sure you're linked to your project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

**Option B: Using Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/021_support_system.sql`
4. Paste and run the SQL

### Step 4: Verify the Fixes

After deployment and migration:

1. **Test `/api/user/role` endpoint:**
   - Open browser console
   - The 404 errors should be gone
   - The endpoint should return `{ "role": "student" }` or similar

2. **Test Notifications Bell:**
   - Click the bell icon in the header
   - A dropdown should appear
   - You should see "No notifications yet" or your existing notifications
   - The unread count badge should work

3. **Test Support Tickets:**
   - Navigate to the support page
   - Try creating a ticket
   - The 500 error should be gone

## Files Changed

### New API Endpoints:
- `app/api/user/role/route.ts`
- `app/api/notifications/stats/route.ts`

### New Assets:
- `public/images/grid-pattern.svg`
- `public/avatars/placeholder.svg`

### Database Migrations:
- `supabase/migrations/021_support_system.sql`

### Modified Files:
- `app/(dashboard)/layout.tsx`

## Environment Variables

No new environment variables are required. The existing Supabase configuration will work.

## Troubleshooting

### If `/api/user/role` still returns 404:
- Clear your browser cache
- Check Vercel deployment logs
- Verify the file was deployed correctly

### If notifications bell doesn't work:
- Check browser console for errors
- Verify the `useNotifications` hook is working
- Check if the notifications table exists in Supabase

### If support tickets still error:
- Verify the migration was applied successfully
- Check Supabase logs for any RLS policy errors
- Ensure the `profiles` table has the correct structure

## Next Steps

After successful deployment:

1. Test all three fixes thoroughly
2. Create some test notifications to verify the bell works
3. Create a test support ticket
4. Monitor error logs for any remaining issues

## Support

If you encounter any issues during deployment:
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Check browser console for client-side errors
