# RLS Infinite Recursion Fix

## Problem Identified

**Error:** `infinite recursion detected in policy for relation "users"`  
**Error Code:** `42P17`

## Root Cause

The RLS policies on the `users` table were causing infinite recursion:

```sql
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
```

This policy checks the `users` table to determine if someone is an admin, but it's checking the same table it's protecting. This creates an infinite loop:

1. Try to SELECT from `users`
2. Check policy: "Is this user an admin?"
3. To check if admin, SELECT from `users` table
4. Check policy: "Is this user an admin?"
5. To check if admin, SELECT from `users` table
6. ... INFINITE RECURSION!

## Solution

Use `auth.jwt()` to check user metadata directly from the JWT token instead of querying the `users` table:

```sql
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
        OR auth.uid() = id
    );
```

This avoids the recursion because it doesn't query the `users` table.

## How to Apply the Fix

### Option 1: Run Migration in Supabase Dashboard (RECOMMENDED)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste this SQL:

```sql
-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Recreate policies without recursion
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

-- Allow service role to insert users (for registration)
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (TRUE);
```

5. Click **Run**
6. Verify it says "Success"

### Option 2: Push Migration File

The migration file has been created at:
```
supabase/migrations/20250101000024_fix_rls_infinite_recursion.sql
```

If you're using Supabase CLI:
```bash
supabase db push
```

## Verification

After applying the fix, test the registration again:

1. Visit: https://sthsc.vercel.app/api/test-db
   - Should return: `{"status":"success"}`

2. Try registering a new user at: https://sthsc.vercel.app/auth/register
   - Should work without 500 errors

3. Check the error is gone:
   - No more "infinite recursion" errors in logs

## Why This Happened

When you set up RLS policies, you need to be careful not to create circular dependencies. The key rules:

1. ❌ **DON'T** query the same table you're protecting in the policy
2. ✅ **DO** use `auth.uid()` for user ID checks
3. ✅ **DO** use `auth.jwt()` for metadata checks (like role)
4. ✅ **DO** query OTHER tables if needed

## Additional Notes

### About JWT User Metadata

When users register, we set `user_metadata` in the auth user:

```typescript
await adminClient.auth.admin.createUser({
  email: email,
  password: password,
  user_metadata: {
    user_type: 'student', // or 'teacher', 'parent', 'admin'
    // ... other metadata
  }
})
```

This metadata is available in the JWT token and can be accessed in RLS policies without querying the database.

### Service Role Bypass

Note that the service role key bypasses RLS entirely, which is why the registration API uses `createAdminClient()` with the service role key to create users.

## Testing After Fix

Run these tests:

1. **Test Database Connection:**
   ```
   https://sthsc.vercel.app/api/test-db
   ```
   Expected: `{"status":"success"}`

2. **Test Email Check:**
   ```
   https://sthsc.vercel.app/api/auth/check-email?email=test@example.com
   ```
   Expected: `{"exists":false,"available":true}`

3. **Test Registration:**
   - Go to registration page
   - Fill out form
   - Submit
   - Should succeed without 500 error

## Related Files

- `supabase/migrations/20250101000024_fix_rls_infinite_recursion.sql` - The fix migration
- `supabase/migrations/20250101000015_create_rls_policies.sql` - Original policies
- `app/api/auth/register/route.ts` - Registration endpoint
- `app/api/auth/check-email/route.ts` - Email check endpoint

## Next Steps

1. Apply the SQL fix in Supabase Dashboard (Option 1 above)
2. Test the `/api/test-db` endpoint
3. Try registering a new user
4. Commit the migration file to your repo for future deployments

```bash
git add supabase/migrations/20250101000024_fix_rls_infinite_recursion.sql
git commit -m "Fix: Resolve RLS infinite recursion on users table"
git push
```
