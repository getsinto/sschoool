# Supabase Migration Errors - Complete Fix Guide

## Problem Summary
Multiple migration files are failing because they reference tables, columns, or types that don't exist yet. This indicates the migrations were created assuming a certain database state that doesn't match your actual Supabase database.

## Errors Found

1. **014_profile_management_tables.sql**: `schema_migrations` table doesn't exist
2. **011_google_meet_integration.sql**: `video_platform` type doesn't exist
3. **010_zoom_integration.sql**: `user_id` column doesn't exist
4. **009_notification_system.sql**: `read` column doesn't exist
5. **008_email_system.sql**: `user_profiles` table doesn't exist
6. **007_chatbot_support.sql**: `ticket_number` column doesn't exist
7. **006_payment_tables.sql**: `payment_intent_id` column doesn't exist

## Root Cause
The migrations assume tables and columns exist from earlier migrations (001-005), but those base tables may not be properly set up in your Supabase database.

## Solution: Start Fresh with Correct Order

### Option 1: Use Only the Base Schema (Recommended for Quick Fix)

Instead of running all migrations, just run the essential ones for login to work:

**Step 1: Run only the base schema**
```sql
-- Run 001_initial_schema.sql first
-- This should create all base tables including users, teachers, students, parents
```

**Step 2: Run the RLS policies fix**
```sql
-- Run 015_fix_users_rls_policies.sql
-- This adds the policies needed for login to work
```

**Step 3: Skip the problematic migrations for now**
- Don't run migrations 006-014 until you need those features
- Focus on getting login working first

### Option 2: Fix Each Migration (Complete Solution)

I'll create a corrected version of the essential migration that combines everything needed for login.

## Quick Fix: Combined Essential Migration

Run this single SQL script in your Supabase SQL Editor to set up everything needed for login:

```sql
-- ============================================================================
-- ESSENTIAL SCHEMA FOR LOGIN - Run this first
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (main profile table)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(200),
  mobile VARCHAR(20),
  country VARCHAR(100),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'teacher', 'student', 'parent')),
  role VARCHAR(20), -- For backward compatibility
  account_status VARCHAR(50) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  profile_photo_url TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT,
  qualifications TEXT,
  experience_years INTEGER,
  bio TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grade_level VARCHAR(50),
  date_of_birth DATE,
  parent_id UUID,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  occupation VARCHAR(100),
  emergency_contact VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Teachers can read own profile" ON teachers;
DROP POLICY IF EXISTS "Teachers can update own profile" ON teachers;
DROP POLICY IF EXISTS "Students can read own profile" ON students;
DROP POLICY IF EXISTS "Students can update own profile" ON students;
DROP POLICY IF EXISTS "Parents can read own profile" ON parents;
DROP POLICY IF EXISTS "Parents can update own profile" ON parents;

-- Users policies
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Teachers policies
CREATE POLICY "Teachers can read own profile"
ON teachers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update own profile"
ON teachers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Students policies
CREATE POLICY "Students can read own profile"
ON students FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
ON students FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Parents policies
CREATE POLICY "Parents can read own profile"
ON parents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Parents can update own profile"
ON parents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teachers_updated_at ON teachers;
CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_parents_updated_at ON parents;
CREATE TRIGGER update_parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Deployment Steps

### Step 1: Backup Your Current Database
```sql
-- In Supabase Dashboard > Database > Backups
-- Create a manual backup before proceeding
```

### Step 2: Run the Essential Migration
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the "Essential Schema for Login" SQL above
4. Click "Run"
5. Verify no errors

### Step 3: Deploy Code Changes
```bash
git add .
git commit -m "fix: resolve login redirect and database schema issues

- Add server-side API route for user profile fetching
- Update useUser hook to use API route
- Fix infinite redirect loop in login component
- Add essential database schema with RLS policies
- Document migration errors and solutions"
git push origin main
```

### Step 4: Test Login
1. Clear browser cache
2. Go to your Vercel deployment
3. Try logging in
4. Should redirect to dashboard successfully

## What This Fixes

✅ Creates all essential tables (users, teachers, students, parents)
✅ Adds proper RLS policies for authenticated access
✅ Sets up indexes for performance
✅ Adds updated_at triggers
✅ Allows login to work properly
✅ Fixes the 500 error when fetching user data

## What to Do About Other Migrations

The other migrations (006-014) add features like:
- Payment system
- Chatbot support
- Email system
- Notifications
- Zoom integration
- Google Meet integration
- Profile management

You can add these later once login is working. For now, focus on getting the core authentication working.

## If You Need Those Features

If you need the features from migrations 006-014, I can create corrected versions that don't have dependency issues. Let me know which features you need and I'll create proper migrations for them.

## Troubleshooting

### If you still get errors:

1. **Check if tables exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. **Check RLS policies:**
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

3. **Verify auth.uid() function works:**
```sql
SELECT auth.uid();
-- Should return your user ID when logged in
```

## Next Steps

1. Run the essential migration SQL
2. Deploy your code changes
3. Test login functionality
4. Once login works, we can add other features incrementally
