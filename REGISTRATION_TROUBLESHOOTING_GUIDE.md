# Registration 500 Error - Troubleshooting Guide

## Problem
Both `/api/auth/check-email` and `/api/auth/register` endpoints are returning 500 Internal Server Error on Vercel deployment.

## Root Cause Analysis

The 500 errors are most likely caused by one of these issues:

### 1. Missing Environment Variables in Vercel
The API routes require these critical environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Schema Mismatch
The `users` table might not have all the required columns that the registration code is trying to insert.

### 3. Missing Database Tables
The `users` table might not exist in your production Supabase instance.

## Solution Steps

### Step 1: Verify Vercel Environment Variables

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (`sthsc`)
3. Go to **Settings** → **Environment Variables**
4. Verify these variables are set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
NEXT_PUBLIC_APP_URL=https://sthsc.vercel.app
RESEND_API_KEY=re_...your-resend-key (for email verification)
```

5. If any are missing, add them
6. **Important**: After adding/updating environment variables, you MUST redeploy

### Step 2: Check Vercel Deployment Logs

1. Go to your Vercel project
2. Click on the latest deployment
3. Go to **Functions** tab
4. Find the `/api/auth/register` and `/api/auth/check-email` functions
5. Click on them to see the actual error logs
6. Look for specific error messages like:
   - "relation 'users' does not exist"
   - "column 'verification_token' does not exist"
   - "undefined environment variable"

### Step 3: Verify Supabase Database Schema

Run this query in your Supabase SQL Editor to check if the users table exists and has all required columns:

```sql
-- Check if users table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check if verification_token and token_expires_at columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('verification_token', 'token_expires_at');
```

### Step 4: Apply Missing Migrations

If the columns are missing, run these migrations in your Supabase SQL Editor:

```sql
-- Add verification token columns if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token 
ON users(verification_token) 
WHERE verification_token IS NOT NULL;
```

### Step 5: Test with Detailed Error Logging

Temporarily add more detailed error logging to see what's failing. Update the register route:

```typescript
// In app/api/auth/register/route.ts
export async function POST(request: NextRequest) {
  try {
    console.log('=== Registration Start ===')
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
    
    const body: RegistrationData = await request.json()
    console.log('Request body received, userType:', body.userType)
    
    // ... rest of the code
    
  } catch (error) {
    console.error('=== Registration Error ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)
    console.error('Full error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
```

### Step 6: Quick Fix - Simplified Error Response

Update both API routes to return more helpful error messages:

```typescript
// app/api/auth/check-email/route.ts
if (error) {
  console.error('Error checking email:', error)
  return NextResponse.json(
    { 
      error: 'Failed to check email',
      details: error.message,
      code: error.code 
    },
    { status: 500 }
  )
}

// app/api/auth/register/route.ts  
if (authError) {
  console.error('Auth user creation error:', authError)
  return NextResponse.json(
    { 
      error: authError.message || 'Failed to create user account',
      code: authError.code,
      details: authError.details 
    },
    { status: 500 }
  )
}
```

## Most Likely Fix

Based on the error pattern, the most likely issue is **missing environment variables in Vercel**. Here's the quick fix:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these three critical variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```
3. Get the values from your Supabase project settings:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings → API
   - Copy the URL and keys
4. After adding variables, trigger a new deployment:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

## Verification

After applying fixes, test:

1. Try registering a new user at https://sthsc.vercel.app/auth/register
2. Check Vercel function logs for any remaining errors
3. Check Supabase logs for database queries
4. Verify email verification is sent (if RESEND_API_KEY is configured)

## Need More Help?

If the issue persists:
1. Share the exact error from Vercel function logs
2. Confirm which environment variables are set in Vercel
3. Share the output of the SQL query checking the users table schema
