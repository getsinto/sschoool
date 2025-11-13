-- Fix RLS policies for users table to allow authenticated users to read their own profile
-- This fixes the 500 error when trying to fetch user data after login

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Also add policies for role-specific tables
-- Teachers table
DROP POLICY IF EXISTS "Teachers can read own profile" ON teachers;
DROP POLICY IF EXISTS "Teachers can update own profile" ON teachers;

CREATE POLICY "Teachers can read own profile"
ON teachers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update own profile"
ON teachers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Students table
DROP POLICY IF EXISTS "Students can read own profile" ON students;
DROP POLICY IF EXISTS "Students can update own profile" ON students;

CREATE POLICY "Students can read own profile"
ON students FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
ON students FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Parents table
DROP POLICY IF EXISTS "Parents can read own profile" ON parents;
DROP POLICY IF EXISTS "Parents can update own profile" ON parents;

CREATE POLICY "Parents can read own profile"
ON parents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Parents can update own profile"
ON parents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
