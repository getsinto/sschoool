# URGENT: Fix "phone" Field Error

## The Problem
Your database still has an OLD trigger that references the "phone" field (which doesn't exist). This is causing registration to fail.

## The Solution (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix
1. Open the file `EMERGENCY_FIX_RUN_THIS_NOW.sql` from your project
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify
The last query in the script will show you if any triggers still exist on `auth.users`. 

**Expected result**: 0 rows (no triggers)

If you see any rows, note the trigger names and let me know.

### Step 4: Test Registration
1. Go to your registration page
2. Try to register a new user
3. It should work now!

## What This Does

1. **Removes** all old triggers that auto-create user profiles
2. **Removes** all old functions that reference "phone"
3. **Creates** the correct `create_user_profile` function
4. **Grants** proper permissions
5. **Verifies** no triggers remain

## Why This Happened

The migrations in your code were correct, but they weren't run in your production database. The old trigger with "phone" field references was still active.

## After Running This

Registration will work immediately. The API will create user profiles explicitly via RPC calls, with no automatic triggers interfering.

## If It Still Fails

Check the Vercel logs for the exact error message and let me know. But this should fix the "phone" field error completely.
