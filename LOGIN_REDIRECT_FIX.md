# Login Redirect Issue - 500 Error Fix

## Problem
After successful login on Vercel, the page keeps animating and doesn't redirect to the dashboard. Console shows:
```
GET https://lbgtvxqlpjsswybbhfxy.supabase.co/rest/v1/users?select=*&id=eq.2be3cf29-93ab-40f6-bcff-61b68f86f9da 500 (Internal Server Error)
```

## Root Cause
The `useUser` hook in `hooks/useUser.ts` is trying to query the `users` table directly from the client side, but:
1. The RLS policies may not allow direct client-side access to the users table
2. The query is being made repeatedly, causing an infinite loop
3. The authentication flow is using Supabase Auth, but the user data fetch is failing

## Solutions

### Solution 1: Fix RLS Policies (Recommended)
Add proper RLS policies to allow authenticated users to read their own data:

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

### Solution 2: Use Server-Side API Route
Instead of querying directly from the client, create an API route:

**Create `app/api/user/profile/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }
    
    // Fetch role-specific profile
    let roleProfile = null
    if (profile.user_type === 'teacher') {
      const { data } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      roleProfile = data
    } else if (profile.user_type === 'student') {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single()
      roleProfile = data
    } else if (profile.user_type === 'parent') {
      const { data } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single()
      roleProfile = data
    }
    
    return NextResponse.json({
      profile,
      roleProfile
    })
  } catch (error: any) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Solution 3: Simplify Login Flow (Quick Fix)
Modify the login to redirect immediately without waiting for full profile data:

**Update `components/auth/LoginContent.tsx`:**
```typescript
const onSubmit = async (data: LoginForm) => {
  setIsLoading(true)
  
  try {
    const { error } = await signIn(data.email, data.password, data.rememberMe)
    
    if (!error) {
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      // Redirect immediately without waiting for full profile
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      router.push(redirectTo)
    }
  } finally {
    setIsLoading(false)
  }
}
```

## Immediate Action Required

1. **Check Supabase RLS Policies:**
   - Go to your Supabase dashboard
   - Navigate to Authentication > Policies
   - Check if the `users` table has proper RLS policies
   - Add the policies from Solution 1 if missing

2. **Verify Database Schema:**
   - Ensure the `users` table exists and has the correct structure
   - Check if the `id` column is properly set up as UUID
   - Verify that auth.users and your custom users table are properly linked

3. **Check Environment Variables:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
   - Ensure these are set in Vercel environment variables

4. **Test Locally:**
   - Try logging in locally to see if the issue persists
   - Check browser console for detailed error messages
   - Use Supabase logs to see the actual error

## Testing Steps

1. Apply RLS policies in Supabase
2. Redeploy to Vercel
3. Clear browser cache and cookies
4. Try logging in again
5. Check browser console for errors
6. Verify redirect works properly

## Additional Notes

- The error suggests the Supabase client is working, but the query is failing
- This is likely a permissions issue, not a code issue
- The infinite loop happens because the useUser hook keeps retrying the failed query
- Consider implementing error boundaries to prevent infinite loops
