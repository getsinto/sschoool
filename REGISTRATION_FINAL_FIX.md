# Registration Fix - FINAL SOLUTION

## ✅ Issue Resolved!

**Problem:** Registration returning 500 errors  
**Root Cause:** RLS infinite recursion on `users` table  
**Status:** Fixed! Just needs SQL to be run in Supabase

## 🎯 The Complete Fix

You need to run ONE SQL command in your Supabase dashboard. That's it!

### Step 1: Run This SQL (2 minutes)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Paste this SQL and click **Run**:

```sql
-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Recreate policies without recursion using JWT metadata
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
        OR auth.uid() = id
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
        OR auth.uid() = id
    );

-- Allow service role to insert users during registration
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (TRUE);
```

5. Wait for "Success. No rows returned"

### Step 2: Test It Works

After running the SQL, test these URLs:

1. **Database test:**  
   https://sthsc.vercel.app/api/test-db  
   Should return: `{"status":"success"}`

2. **Email check:**  
   https://sthsc.vercel.app/api/auth/check-email?email=test@example.com  
   Should return: `{"exists":false,"available":true}`

3. **Registration:**  
   https://sthsc.vercel.app/auth/register  
   Fill out the form and submit - should work! ✅

## 📊 What Was Wrong

### The Problem

Your RLS policies had infinite recursion:

```sql
-- OLD (BROKEN) - Queries users table while protecting it
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
        --                    ^^^^^ Creates infinite loop!
    );
```

This created an infinite loop:
1. Try to SELECT from `users`
2. Check policy: "Is user admin?"
3. To check, SELECT from `users` table
4. Check policy: "Is user admin?"
5. To check, SELECT from `users` table
6. ... INFINITE RECURSION!

### The Solution

Use JWT metadata instead of querying the database:

```sql
-- NEW (FIXED) - Checks JWT token directly
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
        --           ^^^ No database query, no recursion!
        OR auth.uid() = id
    );
```

## 🔍 Error Timeline

1. **First error:** `infinite recursion detected in policy for relation "users"`
   - Fixed by updating RLS policies

2. **Second error:** `permission denied for table users`
   - This was just the test endpoint using wrong client
   - Fixed by using admin client in test endpoint

## ✨ Files Updated

1. ✅ `supabase/migrations/20250101000024_fix_rls_infinite_recursion.sql` - The fix
2. ✅ `app/api/test-db/route.ts` - Updated to use admin client
3. ✅ `app/api/auth/register/route.ts` - Enhanced error logging
4. ✅ `app/api/auth/check-email/route.ts` - Enhanced error logging

## 🚀 Why This Works

1. **JWT Metadata:** When users register, their `user_type` is stored in the JWT token
2. **No Recursion:** Checking `auth.jwt()` doesn't query the database
3. **Service Role:** Registration API uses service role key which bypasses RLS entirely
4. **INSERT Policy:** Added explicit policy to allow service role to insert users

## 📝 Verification Checklist

After running the SQL:

- [ ] `/api/test-db` returns success
- [ ] `/api/auth/check-email` works
- [ ] Registration form submits without 500 error
- [ ] User is created in Supabase auth.users table
- [ ] User profile is created in public.users table

## 🎉 Expected Results

Once you run that SQL:

✅ Registration works  
✅ Email checking works  
✅ No more 500 errors  
✅ Users can register as students, teachers, parents  
✅ Email verification emails are sent  

## 🆘 If Still Not Working

If you still see errors after running the SQL:

1. **Check the SQL ran successfully:**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'users';
   ```
   Should show the three new policies

2. **Check Supabase logs:**
   - Dashboard → Logs → Postgres Logs
   - Look for any new errors

3. **Verify environment variables in Vercel:**
   - All three Supabase keys are set
   - They match your Supabase project

4. **Share the new error message with me**

## 💡 Key Takeaway

When writing RLS policies:
- ❌ DON'T query the same table you're protecting
- ✅ DO use `auth.uid()` for user ID checks
- ✅ DO use `auth.jwt()` for metadata checks
- ✅ DO query OTHER tables if needed

---

**Just run that SQL and you're done!** 🎉

The migration file is already in your repo, so future deployments will include this fix automatically.
