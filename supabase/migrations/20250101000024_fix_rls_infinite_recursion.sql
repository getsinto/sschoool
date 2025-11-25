-- ============================================================================
-- FIX RLS INFINITE RECURSION
-- Version: 1.0.0
-- Description: Fix infinite recursion in users table RLS policies
-- ============================================================================

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Recreate admin policies using auth.jwt() instead of querying users table
-- This avoids the infinite recursion by checking the JWT claim directly
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

-- Comments
COMMENT ON POLICY "Admins can view all users" ON users IS 'Admins can view all users, users can view own profile';
COMMENT ON POLICY "Admins can update all users" ON users IS 'Admins can update all users, users can update own profile';
COMMENT ON POLICY "Service role can insert users" ON users IS 'Service role can insert users during registration';
