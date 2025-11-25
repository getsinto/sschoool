# Registration Database Fix - Final Solution

## Problem
The registration system is failing with "Database error creating new user" because:
1. The database trigger `on_auth_user_created` was trying to automatically create user profiles
2. The registration API was also trying to create profiles via RPC call
3. This created a race condition and conflicts

## Solution
Remove the automatic trigger and rely solely on explicit RPC calls from the registration API.

## Steps to Fix

### Option 1: Run Migration in Supabase Dashboard (RECOMMENDED)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `supabase/migrations/20250101000027_fix_registration_final.sql`
5. Click **Run**
6. Verify the output shows success

### Option 2: Use Supabase CLI

```bash
# Make sure you're logged in
npx supabase login

# Link to your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push the migration
npx supabase db push
```

### Option 3: Manual SQL Execution

If you prefer to run SQL manually, execute these commands in order:

```sql
-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- 2. Drop the old function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Recreate the create_user_profile function
-- (Copy the full function from the migration file)
```

## Verification

After running the migration, test the registration:

1. Go to your registration page
2. Fill out the form completely
3. Submit the registration
4. Check for success message

### Check Database

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if the trigger is removed
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- Should return 0 rows

-- Check if the function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'create_user_profile';
-- Should return 1 row

-- Check recent users
SELECT id, email, full_name, role, account_status, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

## What Changed

### Before
- Auth user created → Trigger fires → Attempts to create profile
- Registration API → Also attempts to create profile
- **Result**: Conflict and errors

### After
- Auth user created → No trigger
- Registration API → Explicitly creates profile via RPC
- **Result**: Clean, controlled profile creation

## Rollback (if needed)

If you need to rollback, run:

```sql
-- This will restore the trigger-based approach
-- (Not recommended, but available if needed)
```

## Next Steps

1. Run the migration using one of the options above
2. Test registration with a new user
3. Verify the user appears in both `auth.users` and `public.users` tables
4. Check that the verification email is sent

## Support

If you encounter any issues:
1. Check Supabase logs in Dashboard → Logs
2. Check Vercel logs for API errors
3. Verify all environment variables are set correctly
