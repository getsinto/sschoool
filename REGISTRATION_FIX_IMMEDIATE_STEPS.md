# Registration 500 Error - Immediate Fix Steps

## What I Just Did

1. ✅ Added detailed error logging to both API routes
2. ✅ Created a diagnostic endpoint at `/api/test-db`
3. ✅ Created comprehensive troubleshooting guide

## Your Next Steps (Do These Now)

### Step 1: Check the Diagnostic Endpoint (2 minutes)

Visit this URL in your browser:
```
https://sthsc.vercel.app/api/test-db
```

This will tell you:
- ✅ If environment variables are set
- ✅ If database connection works
- ✅ What the actual error is

### Step 2: Check Vercel Environment Variables (5 minutes)

1. Go to: https://vercel.com/dashboard
2. Select your `sthsc` project
3. Go to **Settings** → **Environment Variables**
4. Verify these 3 critical variables exist:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**If any are missing:**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
5. Add them to Vercel environment variables
6. Set them for **Production**, **Preview**, and **Development**

### Step 3: Redeploy (1 minute)

After adding environment variables, you MUST redeploy:

```bash
git add .
git commit -m "Add detailed error logging and diagnostic endpoint"
git push
```

Or trigger an empty commit:
```bash
git commit --allow-empty -m "Trigger redeploy after env var update"
git push
```

### Step 4: Test Again (2 minutes)

1. Wait for deployment to complete (watch Vercel dashboard)
2. Visit: `https://sthsc.vercel.app/api/test-db`
3. If it shows "success", try registering again
4. If it shows "error", share the error message with me

### Step 5: Check Vercel Function Logs (3 minutes)

If still failing:

1. Go to Vercel Dashboard → Your Project
2. Click on the latest deployment
3. Go to **Functions** tab
4. Click on `/api/auth/register`
5. Look at the logs - you'll now see detailed error messages
6. Share those logs with me

## Most Common Issues & Quick Fixes

### Issue 1: Missing Environment Variables
**Symptom:** `hasSupabaseUrl: false` or similar in test-db response

**Fix:** Add the missing variables in Vercel (see Step 2 above)

### Issue 2: Wrong Supabase URL
**Symptom:** Connection timeout or "invalid URL"

**Fix:** Double-check the URL format: `https://xxxxx.supabase.co`

### Issue 3: Wrong Service Role Key
**Symptom:** "Invalid API key" or "Unauthorized"

**Fix:** Make sure you're using the `service_role` key, not the `anon` key

### Issue 4: Database Table Missing
**Symptom:** "relation 'users' does not exist"

**Fix:** Run migrations in Supabase SQL Editor:
```sql
-- Check if users table exists
SELECT * FROM users LIMIT 1;
```

If it doesn't exist, you need to run your migrations.

### Issue 5: Missing Columns
**Symptom:** "column 'verification_token' does not exist"

**Fix:** Run this in Supabase SQL Editor:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;
```

## What to Share With Me

If it's still not working after these steps, share:

1. ✅ Output from `/api/test-db` endpoint
2. ✅ Screenshot of Vercel environment variables (hide the actual values)
3. ✅ Error logs from Vercel Functions tab
4. ✅ Any error messages from browser console

## Expected Timeline

- Adding env vars: 5 minutes
- Redeployment: 2-3 minutes
- Testing: 2 minutes
- **Total: ~10 minutes to fix**

## Files Changed

I've updated these files with better error handling:
- `app/api/auth/check-email/route.ts` - Added detailed error responses
- `app/api/auth/register/route.ts` - Added environment logging and detailed errors
- `app/api/test-db/route.ts` - NEW diagnostic endpoint
- `REGISTRATION_TROUBLESHOOTING_GUIDE.md` - Comprehensive guide
- `REGISTRATION_FIX_IMMEDIATE_STEPS.md` - This file

## Commit and Deploy

```bash
git add .
git commit -m "Fix: Add detailed error logging for registration debugging"
git push
```

Then check `/api/test-db` endpoint once deployed!
